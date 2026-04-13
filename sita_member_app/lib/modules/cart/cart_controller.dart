import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/services/api_service.dart';
import '../../data/models/product_model.dart';
import '../../app/routes/app_routes.dart';

class CartItem {
  final Product product;
  int quantity;

  CartItem({required this.product, required this.quantity});

  double get total => product.pricePerUnit * quantity;
  // Market value for foundation fee basis; fallback to SITA price if not set
  double get marketTotal => (product.marketPrice ?? product.pricePerUnit) * quantity;
}

class CartController extends GetxController {
  final items = <CartItem>[].obs;
  final isLoading = false.obs;
  final deliveryAddress = TextEditingController();
  final paymentMethod = 'bank_transfer'.obs;
  final acceptedTerms = false.obs;

  static const double foundationFeePercent = 0.02;

  double get subtotal => items.fold(0.0, (sum, i) => sum + i.total);
  // Foundation fee = 2% of total market value (not SITA price)
  double get marketValueTotal => items.fold(0.0, (sum, i) => sum + i.marketTotal);
  double get foundationFee => marketValueTotal * foundationFeePercent;
  double get total => subtotal + foundationFee;
  int get count => items.length;

  void addItem(Product product, int qty) {
    final existing = items.indexWhere((i) => i.product.id == product.id);
    if (existing >= 0) {
      items[existing].quantity += qty;
      items.refresh();
    } else {
      items.add(CartItem(product: product, quantity: qty));
    }
  }

  void removeItem(String productId) {
    items.removeWhere((i) => i.product.id == productId);
  }

  void updateQty(String productId, int qty) {
    final idx = items.indexWhere((i) => i.product.id == productId);
    if (idx >= 0) {
      if (qty <= 0) {
        items.removeAt(idx);
      } else {
        items[idx].quantity = qty;
        items.refresh();
      }
    }
  }

  void clear() => items.clear();

  Future<void> placeOrder() async {
    if (items.isEmpty) return;
    if (deliveryAddress.text.trim().isEmpty) {
      Get.snackbar('Error', 'Please enter delivery address',
          snackPosition: SnackPosition.BOTTOM);
      return;
    }
    if (!acceptedTerms.value) {
      Get.snackbar('Error', 'Please accept the non-refundable terms',
          snackPosition: SnackPosition.BOTTOM);
      return;
    }

    // Group items by vendor
    final vendorMap = <String, List<CartItem>>{};
    for (final item in items) {
      final vid = item.product.vendor?.id ?? '';
      vendorMap.putIfAbsent(vid, () => []).add(item);
    }

    if (vendorMap.length > 1) {
      Get.snackbar('Info', 'Multiple vendors detected. Placing separate orders.',
          snackPosition: SnackPosition.BOTTOM,
          duration: const Duration(seconds: 3));
    }

    isLoading.value = true;
    try {
      for (final entry in vendorMap.entries) {
        final vendorId = entry.key;
        final vendorItems = entry.value;
        await Get.find<ApiService>().post('/orders', {
          'vendor_id': vendorId,
          'items': vendorItems
              .map((i) => {'product_id': i.product.id, 'quantity': i.quantity})
              .toList(),
          'delivery_address': deliveryAddress.text.trim(),
          'payment_method': paymentMethod.value,
        });
      }
      clear();
      Get.offAllNamed(Routes.home);
      Get.snackbar('Order Placed', 'Your order has been placed successfully!',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.green.shade50,
          colorText: Colors.green.shade800);
    } catch (e) {
      Get.snackbar('Error', e.toString(), snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    deliveryAddress.dispose();
    super.onClose();
  }
}
