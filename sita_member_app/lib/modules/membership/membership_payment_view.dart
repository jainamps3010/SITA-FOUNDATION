import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../app/theme/app_theme.dart';
import 'membership_payment_controller.dart';

class MembershipPaymentView extends GetView<MembershipPaymentController> {
  const MembershipPaymentView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 32),

              // Logo
              Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.18),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: ClipOval(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Image.asset(
                      'assets/logo.png',
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const Icon(
                        Icons.store,
                        size: 56,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 28),

              const Text(
                'Activate Your Membership',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              const Text(
                'One-time fee for lifetime technology access\nto SITA Foundation marketplace',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 14,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 32),

              // Fee card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.primaryDark],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    const Text(
                      'Membership Fee',
                      style: TextStyle(color: Colors.white70, fontSize: 13),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      '₹5,000',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 42,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        'One-time • Non-Refundable',
                        style: TextStyle(
                            color: Colors.white70,
                            fontSize: 12,
                            fontWeight: FontWeight.w500),
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Divider(color: Colors.white24),
                    const SizedBox(height: 16),
                    _benefitRow(Icons.storefront_outlined,
                        'Full marketplace access'),
                    const SizedBox(height: 10),
                    _benefitRow(Icons.local_offer_outlined,
                        'SITA special pricing on all products'),
                    const SizedBox(height: 10),
                    _benefitRow(Icons.account_balance_wallet_outlined,
                        'SITA wallet & rewards'),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Non-refundable agreement checkbox
              Obx(() => GestureDetector(
                    onTap: () => controller.agreed.value = !controller.agreed.value,
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: controller.agreed.value
                            ? AppColors.success.withOpacity(0.06)
                            : Colors.orange.shade50,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: controller.agreed.value
                              ? AppColors.success.withOpacity(0.4)
                              : Colors.orange.shade300,
                          width: 1.5,
                        ),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(
                            controller.agreed.value
                                ? Icons.check_box
                                : Icons.check_box_outline_blank,
                            color: controller.agreed.value
                                ? AppColors.success
                                : Colors.orange.shade600,
                            size: 24,
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Text(
                              'I agree this fee is for technology access and is strictly Non-Refundable. I accept all Terms & Conditions of SITA Foundation membership.',
                              style: TextStyle(
                                fontSize: 13,
                                height: 1.5,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  )),

              const SizedBox(height: 28),

              // Pay Now button
              Obx(() => ElevatedButton(
                    onPressed: (controller.agreed.value && !controller.isLoading.value)
                        ? controller.payMembership
                        : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.secondary,
                      disabledBackgroundColor: AppColors.divider,
                      minimumSize: const Size(double.infinity, 56),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: controller.isLoading.value
                        ? const SizedBox(
                            height: 22,
                            width: 22,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2.5),
                          )
                        : const Text(
                            'Pay Now  •  ₹5,000',
                            style: TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w700,
                                color: Colors.white),
                          ),
                  )),

              const SizedBox(height: 16),

              const Text(
                'Secured payment. Your data is protected.',
                style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _benefitRow(IconData icon, String text) => Row(
        children: [
          Icon(icon, color: Colors.white70, size: 18),
          const SizedBox(width: 10),
          Text(text,
              style: const TextStyle(color: Colors.white, fontSize: 13)),
        ],
      );
}
