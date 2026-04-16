import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/services/api_service.dart';
import '../../core/services/storage_service.dart';
import '../../data/models/member_model.dart';
import '../../app/routes/app_routes.dart';

class HomeController extends GetxController {
  final member = Rxn<Member>();
  final isLoading = false.obs;
  final isRenewing = false.obs;
  final currentIndex = 0.obs;

  @override
  void onInit() {
    super.onInit();
    _loadFromStorage();
    fetchProfile();
  }

  void _loadFromStorage() {
    final data = StorageService.to.member;
    if (data != null) member.value = Member.fromJson(data);
  }

  Future<void> fetchProfile() async {
    try {
      final res = await Get.find<ApiService>().get('/members/profile');
      final m = Member.fromJson(res['member'] as Map<String, dynamic>);
      member.value = m;
      await StorageService.to.saveMember(m.toJson());
    } catch (_) {}
  }

  Future<void> renewMembership(BuildContext context) async {
    // Confirm before proceeding
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Renew Membership'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Annual membership renewal fee:'),
            const SizedBox(height: 8),
            const Text('₹5,000',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orange.shade50,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.orange.shade200),
              ),
              child: const Text(
                '⚠️ This fee is non-refundable and covers marketplace access for 1 year from today.',
                style: TextStyle(fontSize: 13),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1A237E)),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Pay ₹5,000'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    isRenewing.value = true;
    try {
      final res = await Get.find<ApiService>().post('/members/renew-membership', {});
      if (res['member'] != null) {
        final m = Member.fromJson(res['member'] as Map<String, dynamic>);
        member.value = m;
        await StorageService.to.saveMember(m.toJson());
      }
      Get.snackbar(
        'Membership Renewed',
        res['message']?.toString() ?? 'Your membership is now active for another year.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green.shade700,
        colorText: Colors.white,
        duration: const Duration(seconds: 5),
        margin: const EdgeInsets.all(12),
        borderRadius: 12,
      );
    } catch (e) {
      Get.snackbar(
        'Renewal Failed',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.shade50,
        colorText: Colors.red.shade800,
        margin: const EdgeInsets.all(12),
      );
    } finally {
      isRenewing.value = false;
    }
  }

  void logout() {
    StorageService.to.clearAll();
    Get.offAllNamed(Routes.login);
  }
}
