import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/services/api_service.dart';
import '../../data/models/product_model.dart';

class MarketplaceController extends GetxController {
  final products = <Product>[].obs;
  final isLoading = false.obs;
  final selectedCategory = ''.obs;
  final searchCtrl = TextEditingController();

  final categories = [
    'All',
    'grains',
    'pulses',
    'spices',
    'oils',
    'dairy',
    'vegetables',
    'beverages',
    'cleaning',
    'other',
  ];

  @override
  void onInit() {
    super.onInit();
    fetchProducts();
  }

  Future<void> fetchProducts({String? category, String? search}) async {
    isLoading.value = true;
    try {
      String path = '/products?limit=50';
      final cat = category ?? selectedCategory.value;
      final q = search ?? searchCtrl.text.trim();
      if (cat.isNotEmpty && cat != 'All') path += '&category=$cat';
      if (q.isNotEmpty) path += '&search=${Uri.encodeQueryComponent(q)}';

      final res = await Get.find<ApiService>().get(path);
      final list = (res['data'] as List<dynamic>? ?? [])
          .map((e) => Product.fromJson(e as Map<String, dynamic>))
          .toList();
      products.value = list;
    } catch (e) {
      Get.snackbar('Error', e.toString(), snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  void selectCategory(String cat) {
    selectedCategory.value = cat;
    fetchProducts(category: cat);
  }

  @override
  void onClose() {
    searchCtrl.dispose();
    super.onClose();
  }
}
