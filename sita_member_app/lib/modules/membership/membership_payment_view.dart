import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../app/theme/app_theme.dart';
import 'membership_payment_controller.dart';

class MembershipPaymentView extends GetView<MembershipPaymentController> {
  const MembershipPaymentView({super.key});

  static const _bankName = 'THE SURAT DISTRICT CO-OPERATIVE BANK LTD.';
  static const _accountName = 'SANTANI IDEAL TAG AGRO FOUNDATION';
  static const _accountNumber = '007712103002069';
  static const _ifsc = 'SDCB0000077';

  static const _saffron = Color(0xFFFF8F00);

  void _copy(BuildContext context, String value, String label) {
    Clipboard.setData(ClipboardData(text: value));
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle_outline, color: Colors.white, size: 18),
              const SizedBox(width: 8),
              Text('$label copied!',
                  style: const TextStyle(fontWeight: FontWeight.w600)),
            ],
          ),
          duration: const Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
          backgroundColor: _saffron,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          margin: const EdgeInsets.all(12),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        automaticallyImplyLeading: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Pay Membership Fee'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 8),

              // Amount banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFFF6B00), Color(0xFFFF8C00)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: const [
                    Text('Annual Membership Fee',
                        style: TextStyle(color: Colors.white70, fontSize: 13)),
                    SizedBox(height: 4),
                    Text('₹5,000',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 44,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -1)),
                    SizedBox(height: 4),
                    Text('Non-Refundable • Annual',
                        style: TextStyle(color: Colors.white70, fontSize: 12)),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Bank details card
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE5E7EB)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      decoration: const BoxDecoration(
                        color: Color(0xFF1A237E),
                        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                      ),
                      child: Row(
                        children: const [
                          Icon(Icons.account_balance, color: Colors.white, size: 20),
                          SizedBox(width: 10),
                          Text('Bank Transfer Details',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 15)),
                        ],
                      ),
                    ),

                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          _detailRow('Bank Name',    _bankName,      _bankName,      context),
                          _divider(),
                          _detailRow('Account Name', _accountName,   _accountName,   context),
                          _divider(),
                          _detailRow('Account No.',  _accountNumber, _accountNumber, context),
                          _divider(),
                          _detailRow('IFSC Code',    _ifsc,          _ifsc,          context),
                          _divider(),
                          _detailRow('Amount',       '₹5,000',       '5000',         context),
                          _divider(),
                          _detailRow('UPI ID',       'Not Available', null,          context),
                        ],
                      ),
                    ),

                    // Note
                    Container(
                      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF3E0),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFFFCC80)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Icon(Icons.info_outline, color: Color(0xFFE65100), size: 16),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'No UPI available. Please use NEFT / IMPS / RTGS only.',
                              style: TextStyle(
                                  color: Color(0xFFE65100),
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // UTR input
              const Text('UTR / Transaction ID',
                  style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      color: AppColors.textPrimary)),
              const SizedBox(height: 8),
              TextField(
                controller: controller.utrController,
                onChanged: (_) => controller.agreed.refresh(),
                decoration: InputDecoration(
                  hintText: 'Enter UTR or Transaction Reference No.',
                  hintStyle: const TextStyle(color: Colors.grey, fontSize: 13),
                  prefixIcon: const Icon(Icons.receipt_long_outlined,
                      color: AppColors.primary, size: 20),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide:
                        const BorderSide(color: AppColors.primary, width: 1.5),
                  ),
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                '* Mandatory. Enter the reference number from your bank app / receipt.',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 11),
              ),

              const SizedBox(height: 20),

              // Non-refundable checkbox
              Obx(() => GestureDetector(
                    onTap: () => controller.agreed.value = !controller.agreed.value,
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: controller.agreed.value
                            ? const Color(0xFFF0FDF4)
                            : Colors.orange.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: controller.agreed.value
                              ? const Color(0xFF86EFAC)
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
                            size: 22,
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Text(
                              'I confirm the transfer of ₹5,000 to the above account. I understand this annual membership fee is strictly Non-Refundable and I accept SITA Foundation\'s Terms & Conditions.',
                              style: TextStyle(
                                  fontSize: 13,
                                  height: 1.5,
                                  color: AppColors.textPrimary),
                            ),
                          ),
                        ],
                      ),
                    ),
                  )),

              const SizedBox(height: 24),

              // Submit button
              Obx(() => ElevatedButton(
                    onPressed: controller.canSubmit ? controller.submitPayment : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      disabledBackgroundColor: const Color(0xFFE5E7EB),
                      minimumSize: const Size(double.infinity, 54),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    child: controller.isLoading.value
                        ? const SizedBox(
                            height: 22,
                            width: 22,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2.5),
                          )
                        : const Text(
                            'Submit Payment for Verification',
                            style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: Colors.white),
                          ),
                  )),

              const SizedBox(height: 12),

              const Center(
                child: Text(
                  'Admin will verify your payment within 24 hours.',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                  textAlign: TextAlign.center,
                ),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _detailRow(
      String label, String value, String? copyValue, BuildContext context) {
    final isBold = copyValue != null;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            width: 100,
            child: Text(label,
                style: const TextStyle(
                    color: Color(0xFF6B7280),
                    fontSize: 12,
                    fontWeight: FontWeight.w500)),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                  color: const Color(0xFF111827),
                  fontSize: 13,
                  fontWeight: isBold ? FontWeight.w700 : FontWeight.w500),
            ),
          ),
          if (copyValue != null)
            SizedBox(
              width: 36,
              height: 36,
              child: IconButton(
                padding: EdgeInsets.zero,
                onPressed: () => _copy(context, copyValue, label),
                icon: const Icon(Icons.copy, size: 18),
                color: _saffron,
                tooltip: 'Copy $label',
                style: IconButton.styleFrom(
                  backgroundColor: const Color(0xFFFFF8E1),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8)),
                ),
              ),
            )
          else
            const SizedBox(width: 36),
        ],
      ),
    );
  }

  Widget _divider() =>
      const Divider(height: 1, color: Color(0xFFF3F4F6));
}
