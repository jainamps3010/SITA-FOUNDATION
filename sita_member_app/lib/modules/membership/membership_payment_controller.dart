import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/services/api_service.dart';
import '../../core/services/storage_service.dart';
import '../../app/routes/app_routes.dart';

class MembershipPaymentController extends GetxController {
  final isLoading = false.obs;
  final agreed = false.obs;

  static const double membershipFee = 5000.0;

  Future<void> payMembership() async {
    if (!agreed.value) return;
    isLoading.value = true;
    try {
      final res = await Get.find<ApiService>().post('/members/membership/pay', {});
      // Update stored member data
      if (res['member'] != null) {
        await StorageService.to.saveMember(res['member'] as Map<String, dynamic>);
      }
      Get.offAllNamed(Routes.home);
      Get.snackbar(
        'Membership Activated',
        'Welcome! You now have full marketplace access.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green.shade700,
        colorText: Colors.white,
        duration: const Duration(seconds: 4),
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
}
