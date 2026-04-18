import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/services/api_service.dart';
import '../../core/services/storage_service.dart';
import '../../app/routes/app_routes.dart';

class MembershipPaymentController extends GetxController {
  final isLoading = false.obs;
  final agreed = false.obs;
  final utrController = TextEditingController();

  static const double membershipFee = 5000.0;

  @override
  void onClose() {
    utrController.dispose();
    super.onClose();
  }

  bool get canSubmit =>
      agreed.value &&
      !isLoading.value &&
      utrController.text.trim().isNotEmpty;

  Future<void> submitPayment() async {
    if (!agreed.value) return;
    final utr = utrController.text.trim();
    if (utr.isEmpty) {
      Get.snackbar('Required', 'Please enter your UTR / Transaction ID',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.orange.shade50,
          colorText: Colors.orange.shade800);
      return;
    }

    isLoading.value = true;
    try {
      final res = await Get.find<ApiService>()
          .post('/members/submit-payment', {'utr_number': utr, 'amount': 5000});
      if (res['member'] != null) {
        await StorageService.to.saveMember(res['member'] as Map<String, dynamic>);
      }
      Get.offAllNamed(Routes.home);
      Get.snackbar(
        'Payment Submitted',
        'Admin will verify your payment within 24 hours.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green.shade700,
        colorText: Colors.white,
        duration: const Duration(seconds: 5),
        margin: const EdgeInsets.all(12),
        borderRadius: 12,
      );
    } on ApiException catch (e) {
      Get.snackbar('Error', e.message,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red.shade50,
          colorText: Colors.red.shade800);
    } catch (_) {
      Get.snackbar('Network Error', 'Could not reach server. Please try again.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red.shade50,
          colorText: Colors.red.shade800);
    } finally {
      isLoading.value = false;
    }
  }

  // Legacy method kept for backward compatibility
  Future<void> payMembership() => submitPayment();
}
