import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../app/theme/app_theme.dart';
import 'feedback_controller.dart';

class FeedbackView extends GetView<FeedbackController> {
  const FeedbackView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Feedback')),
      body: Obx(() {
        if (controller.isSubmitted.value) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 80, height: 80,
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check_circle_outline, color: AppColors.success, size: 48),
                  ),
                  const SizedBox(height: 20),
                  const Text('Thank You!',
                      style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.primary)),
                  const SizedBox(height: 12),
                  const Text(
                    'Thank you for your feedback!\nWe will review it shortly.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.6),
                  ),
                  const SizedBox(height: 32),
                  ElevatedButton(
                    onPressed: () => Get.back(),
                    child: const Text('Back to Profile'),
                  ),
                ],
              ),
            ),
          );
        }

        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Rating
            _card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _sectionLabel('RATE YOUR EXPERIENCE'),
                  const SizedBox(height: 12),
                  Obx(() => Row(
                    children: List.generate(5, (i) {
                      final filled = i < controller.rating.value;
                      return GestureDetector(
                        onTap: () => controller.rating.value = i + 1,
                        child: Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: Icon(
                            filled ? Icons.star_rounded : Icons.star_outline_rounded,
                            color: filled ? AppColors.secondary : AppColors.divider,
                            size: 40,
                          ),
                        ),
                      );
                    }),
                  )),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Category
            _card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _sectionLabel('CATEGORY *'),
                  const SizedBox(height: 8),
                  Obx(() => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF5F5F5),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.divider),
                    ),
                    child: DropdownButton<String>(
                      value: controller.selectedCategory.value,
                      hint: const Text('Select a category',
                          style: TextStyle(color: AppColors.textSecondary)),
                      isExpanded: true,
                      underline: const SizedBox.shrink(),
                      items: controller.categories
                          .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                          .toList(),
                      onChanged: (v) => controller.selectedCategory.value = v,
                    ),
                  )),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Description
            _card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _sectionLabel('DESCRIPTION *'),
                  const SizedBox(height: 8),
                  TextField(
                    controller: controller.descriptionCtrl,
                    maxLines: 5,
                    decoration: const InputDecoration(
                      hintText: 'Please describe your feedback in detail (min 20 characters)...',
                      filled: true,
                      fillColor: Color(0xFFF5F5F5),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Order ID (optional)
            _card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    _sectionLabel('ORDER ID'),
                    const SizedBox(width: 6),
                    const Text('(optional)',
                        style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                  ]),
                  const SizedBox(height: 8),
                  TextField(
                    controller: controller.orderIdCtrl,
                    decoration: const InputDecoration(
                      hintText: 'e.g. ORD-2024-001 (if related to a specific order)',
                      filled: true,
                      fillColor: Color(0xFFF5F5F5),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            Obx(() => ElevatedButton(
              onPressed: controller.isSubmitting.value ? null : controller.submit,
              child: controller.isSubmitting.value
                  ? const SizedBox(height: 22, width: 22,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Submit Feedback'),
            )),
            const SizedBox(height: 24),
          ],
        );
      }),
    );
  }

  Widget _card({required Widget child}) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: AppColors.divider, width: 0.8),
    ),
    child: child,
  );

  Widget _sectionLabel(String text) => Text(
    text,
    style: const TextStyle(
      fontSize: 11,
      color: AppColors.textSecondary,
      fontWeight: FontWeight.w700,
      letterSpacing: 0.8,
    ),
  );
}
