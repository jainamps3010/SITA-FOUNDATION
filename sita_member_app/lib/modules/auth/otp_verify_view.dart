import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import '../../app/theme/app_theme.dart';
import 'login_controller.dart';

class OtpVerifyView extends GetView<LoginController> {
  const OtpVerifyView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Verify OTP'),
        backgroundColor: AppColors.primary,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 24),
              Center(
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.sms_outlined,
                      color: AppColors.primary, size: 36),
                ),
              ),
              const SizedBox(height: 24),
              Center(
                child: Obx(() => Column(
                      children: [
                        const Text(
                          'OTP Sent Successfully',
                          style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Enter the 6-digit OTP sent to\n+91 ${controller.phone.value}',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                              color: AppColors.textSecondary, fontSize: 14, height: 1.5),
                        ),
                        if (controller.devOtp != null) ...[
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.orange.shade50,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.orange.shade200),
                            ),
                            child: Text(
                              'DEV OTP: ${controller.devOtp}',
                              style: TextStyle(
                                  color: Colors.orange.shade800,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 13),
                            ),
                          ),
                        ],
                      ],
                    )),
              ),
              const SizedBox(height: 36),
              Obx(() => PinCodeTextField(
                    appContext: context,
                    length: 6,
                    keyboardType: TextInputType.number,
                    animationType: AnimationType.fade,
                    pinTheme: PinTheme(
                      shape: PinCodeFieldShape.box,
                      borderRadius: BorderRadius.circular(12),
                      fieldHeight: 56,
                      fieldWidth: 48,
                      activeColor: AppColors.primary,
                      selectedColor: AppColors.primary,
                      inactiveColor: AppColors.divider,
                      activeFillColor: Colors.white,
                      selectedFillColor: AppColors.primary.withOpacity(0.05),
                      inactiveFillColor: Colors.white,
                    ),
                    enableActiveFill: true,
                    onCompleted: (otp) => controller.verifyOtp(otp),
                    onChanged: (_) {},
                    enabled: !controller.isLoading.value,
                  )),
              const SizedBox(height: 24),
              Obx(() => ElevatedButton(
                    onPressed: controller.isLoading.value ? null : null,
                    child: controller.isLoading.value
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2))
                        : const Text('Verifying...'),
                  )),
              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: controller.isLoading.value ? null : controller.sendOtp,
                  child: const Text(
                    'Resend OTP',
                    style: TextStyle(color: AppColors.primary),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
