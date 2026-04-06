import 'package:get/get.dart';
import '../../core/services/api_service.dart';
import '../../data/models/product_model.dart';
import '../cart/cart_controller.dart';

class ProductDetailController extends GetxController {
  final product = Rxn<Product>();
  final isLoading = false.obs;
  final quantity = 1.obs;

  @override
  void onInit() {
    super.onInit();
    final arg = Get.arguments;
    if (arg is Product) {
      product.value = arg;
      quantity.value = arg.moq;
      fetchDetail(arg.id);
    } else if (arg is String) {
      fetchDetail(arg);
    }
  }

  Future<void> fetchDetail(String id) async {
    isLoading.value = true;
    try {
      final res = await Get.find<ApiService>().get('/products/$id');
      final p = Product.fromJson(res['product'] as Map<String, dynamic>);
      product.value = p;
      if (quantity.value < p.moq) quantity.value = p.moq;
    } catch (e) {
      Get.snackbar('Error', e.toString(), snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  void increment() {
    quantity.value++;
  }

  void decrement() {
    final p = product.value;
    if (p != null && quantity.value > p.moq) {
      quantity.value--;
    }
  }

  void addToCart() {
    final p = product.value;
    if (p == null) return;
    final cart = Get.find<CartController>();
    cart.addItem(p, quantity.value);
    Get.snackbar(
      'Added to Cart',
      '${p.name} x${quantity.value} added',
      snackPosition: SnackPosition.BOTTOM,
    );
  }
}
