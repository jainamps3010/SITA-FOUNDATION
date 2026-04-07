import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/models/order_model.dart';

class DefectReportController extends GetxController {
  static const _baseUrl = 'http://192.168.0.102:3000/api/v1';

  late final Order order;
  final descriptionController = TextEditingController();
  final photo = Rx<({Uint8List bytes, String filename})?>(null);
  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    order = Get.arguments as Order;
  }

  @override
  void onClose() {
    descriptionController.dispose();
    super.onClose();
  }

  Future<void> pickPhoto() async {
    final xFile = await ImagePicker().pickImage(
      source: ImageSource.camera,
      imageQuality: 70,
      maxWidth: 1280,
    );
    if (xFile == null) return;
    final bytes = await xFile.readAsBytes();
    photo.value = (bytes: bytes, filename: xFile.name);
  }

  Future<void> submit() async {
    final desc = descriptionController.text.trim();
    if (desc.isEmpty) {
      Get.snackbar('Validation', 'Please enter a description',
          snackPosition: SnackPosition.BOTTOM);
      return;
    }
    if (photo.value == null) {
      Get.snackbar('Validation', 'Please capture a defect photo',
          snackPosition: SnackPosition.BOTTOM);
      return;
    }
    isLoading.value = true;
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('driver_auth_token');

      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$_baseUrl/delivery/defect'),
      );
      if (token != null) request.headers['Authorization'] = 'Bearer $token';
      request.fields['order_id'] = order.id.toString();
      request.fields['description'] = desc;
      request.files.add(http.MultipartFile.fromBytes(
        'photo',
        photo.value!.bytes,
        filename: photo.value!.filename,
      ));

      final streamed = await request.send();
      if (streamed.statusCode >= 200 && streamed.statusCode < 300) {
        Get.back();
        Get.snackbar('Submitted', 'Defect report submitted successfully',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: const Color(0xFF2E7D32),
            colorText: Colors.white);
      } else {
        Get.snackbar('Error', 'Failed to submit defect report',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.red,
            colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('Error', 'Could not connect to server',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red,
          colorText: Colors.white);
    } finally {
      isLoading.value = false;
    }
  }
}
