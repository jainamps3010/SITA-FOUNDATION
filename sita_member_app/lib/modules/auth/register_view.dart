import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../app/theme/app_theme.dart';
import 'login_controller.dart';

class RegisterView extends GetView<LoginController> {
  const RegisterView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Register as Member')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, color: AppColors.primary, size: 20),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Registration is subject to SITA Foundation approval. You will be notified once verified.',
                      style: TextStyle(color: AppColors.primary, fontSize: 13, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            _label('Full Name *'),
            _field(controller.nameCtrl, 'Your full name'),
            _label('Mobile Number *'),
            TextField(
              controller: controller.phoneCtrl,
              keyboardType: TextInputType.phone,
              maxLength: 10,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              decoration: const InputDecoration(
                hintText: '10-digit mobile number',
                prefixText: '+91  ',
                counterText: '',
              ),
            ),
            _label('Hotel / Restaurant Name *'),
            _field(controller.hotelCtrl, 'Business name'),
            _label('Email Address'),
            _field(controller.emailCtrl, 'email@example.com',
                type: TextInputType.emailAddress),
            _label('GST Number'),
            TextField(
              controller: controller.gstinCtrl,
              decoration: const InputDecoration(hintText: '15-digit GSTIN'),
              textCapitalization: TextCapitalization.characters,
              maxLength: 15,
            ),
            _label('Hotel Address'),
            _field(controller.addressCtrl, 'Street address', maxLines: 2),
            Row(
              children: [
                Expanded(child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [_label('City'), _field(controller.cityCtrl, 'City')],
                )),
                const SizedBox(width: 12),
                Expanded(child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [_label('State'), _field(controller.stateCtrl, 'State')],
                )),
              ],
            ),
            _label('Pincode'),
            TextField(
              controller: controller.pincodeCtrl,
              keyboardType: TextInputType.number,
              maxLength: 6,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              decoration: const InputDecoration(hintText: '6-digit pincode', counterText: ''),
            ),
            const SizedBox(height: 28),
            Obx(() => ElevatedButton(
                  onPressed: controller.isLoading.value ? null : controller.register,
                  child: controller.isLoading.value
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2))
                      : const Text('Submit Application'),
                )),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _label(String text) => Padding(
        padding: const EdgeInsets.only(top: 16, bottom: 6),
        child: Text(text,
            style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: AppColors.textPrimary)),
      );

  Widget _field(
    TextEditingController ctrl,
    String hint, {
    TextInputType type = TextInputType.text,
    int maxLines = 1,
  }) =>
      TextField(
        controller: ctrl,
        keyboardType: type,
        maxLines: maxLines,
        decoration: InputDecoration(hintText: hint),
      );
}
