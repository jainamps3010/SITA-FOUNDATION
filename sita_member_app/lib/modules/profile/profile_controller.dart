import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/services/api_service.dart';
import '../../core/services/storage_service.dart';
import '../../data/models/member_model.dart';
import '../../app/routes/app_routes.dart';

class ProfileController extends GetxController {
  final member = Rxn<Member>();
  final isLoading = false.obs;
  final isSaving = false.obs;

  final nameCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final hotelCtrl = TextEditingController();
  final addressCtrl = TextEditingController();
  final cityCtrl = TextEditingController();
  final stateCtrl = TextEditingController();

  @override
  void onInit() {
    super.onInit();
    _loadFromStorage();
    fetchProfile();
  }

  void _loadFromStorage() {
    final data = StorageService.to.member;
    if (data != null) {
      _populate(Member.fromJson(data));
    }
  }

  void _populate(Member m) {
    member.value = m;
    nameCtrl.text = m.name;
    emailCtrl.text = m.email ?? '';
    hotelCtrl.text = m.hotelName ?? '';
    addressCtrl.text = m.hotelAddress ?? '';
    cityCtrl.text = m.city ?? '';
    stateCtrl.text = m.state ?? '';
  }

  Future<void> fetchProfile() async {
    isLoading.value = true;
    try {
      final res = await Get.find<ApiService>().get('/members/profile');
      final m = Member.fromJson(res['member'] as Map<String, dynamic>);
      _populate(m);
      await StorageService.to.saveMember(m.toJson());
    } catch (_) {} finally {
      isLoading.value = false;
    }
  }

  Future<void> saveProfile() async {
    isSaving.value = true;
    try {
      final res = await Get.find<ApiService>().put('/members/profile', {
        'name': nameCtrl.text.trim(),
        'email': emailCtrl.text.trim().isEmpty ? null : emailCtrl.text.trim(),
        'hotel_name': hotelCtrl.text.trim(),
        'hotel_address': addressCtrl.text.trim(),
        'city': cityCtrl.text.trim(),
        'state': stateCtrl.text.trim(),
      });
      final m = Member.fromJson(res['member'] as Map<String, dynamic>);
      _populate(m);
      await StorageService.to.saveMember(m.toJson());
      Get.snackbar('Saved', 'Profile updated successfully',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.green.shade50,
          colorText: Colors.green.shade800);
    } catch (e) {
      Get.snackbar('Error', e.toString(), snackPosition: SnackPosition.BOTTOM);
    } finally {
      isSaving.value = false;
    }
  }

  void logout() {
    StorageService.to.clearAll();
    Get.offAllNamed(Routes.login);
  }

  @override
  void onClose() {
    nameCtrl.dispose();
    emailCtrl.dispose();
    hotelCtrl.dispose();
    addressCtrl.dispose();
    cityCtrl.dispose();
    stateCtrl.dispose();
    super.onClose();
  }
}
