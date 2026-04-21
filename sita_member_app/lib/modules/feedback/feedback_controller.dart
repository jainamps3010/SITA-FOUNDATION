import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/services/api_service.dart';

class FeedbackController extends GetxController {
  final categories = ['Product Quality', 'Delivery Issue', 'App Problem', 'Pricing Issue', 'Other'];

  final selectedCategory = RxnString();
  final descriptionCtrl = TextEditingController();
  final orderIdCtrl = TextEditingController();
  final rating = 0.obs;
  final isSubmitting = false.obs;
  final isSubmitted = false.obs;

  @override
  void onClose() {
    descriptionCtrl.dispose();
    orderIdCtrl.dispose();
    super.onClose();
  }

  Future<void> submit() async {
    if (selectedCategory.value == null) {
      Get.snackbar('Error', 'Please select a category',
          backgroundColor: Colors.red, colorText: Colors.white);
      return;
    }
    if (descriptionCtrl.text.trim().length < 20) {
      Get.snackbar('Error', 'Please describe your feedback (min 20 characters)',
          backgroundColor: Colors.red, colorText: Colors.white);
      return;
    }
    if (rating.value == 0) {
      Get.snackbar('Error', 'Please provide a star rating',
          backgroundColor: Colors.red, colorText: Colors.white);
      return;
    }

    isSubmitting.value = true;
    try {
      final body = {
        'category': selectedCategory.value!,
        'description': descriptionCtrl.text.trim(),
        'rating': rating.value,
        if (orderIdCtrl.text.trim().isNotEmpty) 'order_id': orderIdCtrl.text.trim(),
      };
      await Get.find<ApiService>().post('/members/feedback', body);
      isSubmitted.value = true;
    } catch (e) {
      Get.snackbar('Error', e.toString(),
          backgroundColor: Colors.red, colorText: Colors.white);
    } finally {
      isSubmitting.value = false;
    }
  }
}
