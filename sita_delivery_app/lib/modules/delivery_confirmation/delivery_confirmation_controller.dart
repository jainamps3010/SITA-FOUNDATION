import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/models/order_model.dart';

class DeliveryConfirmationController extends GetxController {
  static const _baseUrl = 'http://192.168.0.102:3000/api/v1';

  late final Order order;
  final otpController = TextEditingController();
  final photos = <({Uint8List bytes, String filename})>[].obs;
  final isLoading = false.obs;
  final otpText = ''.obs;

  bool get canConfirm =>
      otpText.value.trim().isNotEmpty && photos.isNotEmpty;

  @override
  void onInit() {
    super.onInit();
    order = Get.arguments as Order;
    otpController.addListener(() => otpText.value = otpController.text);
  }

  @override
  void onClose() {
    otpController.dispose();
    super.onClose();
  }

  Future<void> pickPhoto() async {
    if (photos.length >= 3) {
      Get.snackbar('Limit reached', 'You can add up to 3 photos',
          snackPosition: SnackPosition.BOTTOM);
      return;
    }
    final xFile = await ImagePicker().pickImage(
      source: ImageSource.camera,
      imageQuality: 70,
      maxWidth: 1280,
    );
    if (xFile == null) return;
    final bytes = await xFile.readAsBytes();
    photos.add((bytes: bytes, filename: xFile.name));
  }

  void removePhoto(int index) => photos.removeAt(index);

  Future<void> confirmDelivery() async {
    if (!canConfirm) return;
    isLoading.value = true;
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('driver_auth_token');

      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$_baseUrl/delivery/confirm'),
      );
      if (token != null) request.headers['Authorization'] = 'Bearer $token';
      request.fields['order_id'] = order.id.toString();
      request.fields['otp'] = otpController.text.trim();

      for (int i = 0; i < photos.length; i++) {
        request.files.add(http.MultipartFile.fromBytes(
          'photo_$i',
          photos[i].bytes,
          filename: photos[i].filename,
        ));
      }

      final streamed = await request.send();
      if (streamed.statusCode >= 200 && streamed.statusCode < 300) {
        Get.dialog(_SuccessDialog(orderId: order.id), barrierDismissible: false);
      } else {
        Get.snackbar('Error', 'Delivery confirmation failed',
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

class _SuccessDialog extends StatelessWidget {
  final int orderId;
  const _SuccessDialog({required this.orderId});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: const Color(0xFFE8F5E9),
                borderRadius: BorderRadius.circular(40),
              ),
              child: const Icon(
                Icons.check_circle_rounded,
                color: Color(0xFF2E7D32),
                size: 48,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Delivery Complete!',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: Color(0xFF1A1A1A),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Order #$orderId has been successfully delivered.',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, color: Color(0xFF757575)),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Get.offAllNamed('/deliveries'),
              child: const Text('Back to Deliveries'),
            ),
          ],
        ),
      ),
    );
  }
}
