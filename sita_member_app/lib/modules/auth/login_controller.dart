import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/services/api_service.dart';
import '../../core/services/storage_service.dart';
import '../../data/models/member_model.dart';
import '../../app/routes/app_routes.dart';

class LoginController extends GetxController {
  final phoneCtrl = TextEditingController();
  final nameCtrl = TextEditingController();
  final hotelCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final addressCtrl = TextEditingController();
  final cityCtrl = TextEditingController();
  final stateCtrl = TextEditingController();
  final pincodeCtrl = TextEditingController();
  final gstinCtrl = TextEditingController();

  final isLoading = false.obs;
  final phone = ''.obs;
  String? devOtp;

  Future<void> sendOtp() async {
    final p = phoneCtrl.text.trim();
    if (p.length != 10) {
      Get.snackbar('Error', 'Enter a valid 10-digit mobile number',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red.shade50,
          colorText: Colors.red.shade800);
      return;
    }

    isLoading.value = true;
    try {
      final res = await Get.find<ApiService>().post('/auth/member/send-otp', {'phone': p});
      phone.value = p;
      devOtp = res['dev_otp']?.toString();
      Get.toNamed(Routes.otpVerify);
      Get.snackbar('OTP Sent', res['message'] ?? 'OTP sent to +91 $p',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.green.shade50,
          colorText: Colors.green.shade800);
    } on ApiException catch (e) {
      if (e.statusCode == 404) {
        Get.snackbar('Not Registered',
            'This number is not registered. Please register first.',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.orange.shade50,
            colorText: Colors.orange.shade800,
            duration: const Duration(seconds: 4));
      } else {
        Get.snackbar('Error', e.message,
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.red.shade50,
            colorText: Colors.red.shade800);
      }
    } catch (_) {
      Get.snackbar('Network Error',
          'Could not reach server. Check your connection.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red.shade50,
          colorText: Colors.red.shade800);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> verifyOtp(String otp) async {
    if (otp.length != 6) return;
    isLoading.value = true;
    try {
      final res = await Get.find<ApiService>()
          .post('/auth/member/verify-otp', {'phone': phone.value, 'otp': otp});
      final token = res['token'] as String;
      final memberData = res['member'] as Map<String, dynamic>;
      await StorageService.to.saveToken(token);
      await StorageService.to.saveMember(memberData);
      final member = Member.fromJson(memberData);
      // If KYC approved (active) but membership not paid, go to payment screen
      if (member.isActive && !member.membershipPaid) {
        Get.offAllNamed(Routes.membershipPayment);
      } else {
        Get.offAllNamed(Routes.home);
      }
    } on ApiException catch (e) {
      Get.snackbar('Error', e.message,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red.shade50,
          colorText: Colors.red.shade800);
    } catch (_) {
      Get.snackbar('Network Error',
          'Could not reach server. Check your connection.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red.shade50,
          colorText: Colors.red.shade800);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> register() async {
    final name = nameCtrl.text.trim();
    final phone = phoneCtrl.text.trim();
    final hotel = hotelCtrl.text.trim();

    if (name.isEmpty) {
      Get.snackbar('Required', 'Please enter your full name',
          snackPosition: SnackPosition.BOTTOM);
      return;
    }
    if (phone.length != 10 || !RegExp(r'^[6-9]\d{9}$').hasMatch(phone)) {
      Get.snackbar('Invalid Number', 'Enter a valid 10-digit Indian mobile number',
          snackPosition: SnackPosition.BOTTOM);
      return;
    }
    if (hotel.isEmpty) {
      Get.snackbar('Required', 'Please enter your hotel / restaurant name',
          snackPosition: SnackPosition.BOTTOM);
      return;
    }

    // Build body without null — express-validator rejects null for optional fields
    final body = <String, dynamic>{
      'name': name,
      'phone': phone,
      'hotel_name': hotel,
    };
    final email = emailCtrl.text.trim();
    final address = addressCtrl.text.trim();
    final city = cityCtrl.text.trim();
    final state = stateCtrl.text.trim();
    final pincode = pincodeCtrl.text.trim();
    final gstin = gstinCtrl.text.trim();

    if (email.isNotEmpty) body['email'] = email;
    if (address.isNotEmpty) body['hotel_address'] = address;
    if (city.isNotEmpty) body['city'] = city;
    if (state.isNotEmpty) body['state'] = state;
    if (pincode.isNotEmpty) body['pincode'] = pincode;
    if (gstin.isNotEmpty) body['gstin'] = gstin;

    isLoading.value = true;
    try {
      await Get.find<ApiService>().post('/members/register', body);
      Get.offAllNamed(Routes.login);
      // Show after navigation so it's visible on the login screen
      await Future.delayed(const Duration(milliseconds: 300));
      Get.snackbar(
        'Application Submitted',
        'Registration submitted, wait for admin approval',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green.shade700,
        colorText: Colors.white,
        duration: const Duration(seconds: 5),
        margin: const EdgeInsets.all(12),
        borderRadius: 12,
      );
    } on ApiException catch (e) {
      final msg = e.statusCode == 409
          ? 'This mobile number is already registered.'
          : e.message;
      Get.snackbar('Registration Failed', msg,
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red.shade50,
          colorText: Colors.red.shade800,
          duration: const Duration(seconds: 4));
    } catch (e) {
      Get.snackbar('Network Error',
          'Could not reach server. Check your connection and try again.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red.shade50,
          colorText: Colors.red.shade800);
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    phoneCtrl.dispose();
    nameCtrl.dispose();
    hotelCtrl.dispose();
    emailCtrl.dispose();
    addressCtrl.dispose();
    cityCtrl.dispose();
    stateCtrl.dispose();
    pincodeCtrl.dispose();
    gstinCtrl.dispose();
    super.onClose();
  }
}
