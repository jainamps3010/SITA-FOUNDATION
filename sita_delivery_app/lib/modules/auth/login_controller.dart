import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class LoginController extends GetxController {
  static const _baseUrl = 'http://192.168.0.102:3000/api/v1';

  final phoneController = TextEditingController();
  final otpController = TextEditingController();

  final isLoading = false.obs;
  final phone = ''.obs;

  @override
  void onClose() {
    phoneController.dispose();
    otpController.dispose();
    super.onClose();
  }

  Future<void> sendOtp() async {
    final p = phoneController.text.trim();
    if (p.length < 10) {
      Get.snackbar('Error', 'Enter a valid 10-digit mobile number',
          backgroundColor: Colors.red, colorText: Colors.white);
      return;
    }
    isLoading.value = true;
    try {
      final res = await http.post(
        Uri.parse('$_baseUrl/auth/send-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'phone': p, 'role': 'driver'}),
      );
      if (res.statusCode >= 200 && res.statusCode < 300) {
        phone.value = p;
        Get.toNamed('/otp-verify');
      } else {
        final body = jsonDecode(res.body);
        Get.snackbar('Error', body['message'] ?? 'Failed to send OTP',
            backgroundColor: Colors.red, colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('Error', 'Could not connect to server',
          backgroundColor: Colors.red, colorText: Colors.white);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> verifyOtp() async {
    final otp = otpController.text.trim();
    if (otp.length < 4) {
      Get.snackbar('Error', 'Enter the OTP sent to your number',
          backgroundColor: Colors.red, colorText: Colors.white);
      return;
    }
    isLoading.value = true;
    try {
      final res = await http.post(
        Uri.parse('$_baseUrl/auth/verify-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'phone': phone.value, 'otp': otp, 'role': 'driver'}),
      );
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      if (res.statusCode >= 200 && res.statusCode < 300) {
        final token = data['token'] as String?;
        if (token != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('driver_auth_token', token);
          final driver = data['driver'];
          if (driver != null) {
            await prefs.setString('driver_data', jsonEncode(driver));
          }
          Get.offAllNamed('/deliveries');
        } else {
          Get.snackbar('Error', 'Invalid response from server',
              backgroundColor: Colors.red, colorText: Colors.white);
        }
      } else {
        Get.snackbar('Error', data['message'] ?? 'Invalid OTP',
            backgroundColor: Colors.red, colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('Error', 'Could not connect to server',
          backgroundColor: Colors.red, colorText: Colors.white);
    } finally {
      isLoading.value = false;
    }
  }

  void resendOtp() {
    otpController.clear();
    sendOtp();
  }
}
