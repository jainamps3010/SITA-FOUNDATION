import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../app/theme/app_theme.dart';
import '../../data/models/order_model.dart';
import 'delivery_confirmation_controller.dart';

class DeliveryConfirmationView
    extends GetView<DeliveryConfirmationController> {
  const DeliveryConfirmationView({super.key});

  @override
  Widget build(BuildContext context) {
    final order = controller.order;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Confirm Delivery'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Get.back(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Order summary
          _SummaryCard(order: order),
          const SizedBox(height: 16),

          // OTP section
          _SectionHeader(
              icon: Icons.lock_outline_rounded, title: 'Member OTP Verification'),
          const SizedBox(height: 10),
          TextField(
            controller: controller.otpController,
            keyboardType: TextInputType.number,
            maxLength: 6,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              letterSpacing: 10,
              color: AppColors.green,
            ),
            textAlign: TextAlign.center,
            decoration: InputDecoration(
              counterText: '',
              hintText: 'Enter OTP',
              hintStyle: const TextStyle(
                fontSize: 16,
                letterSpacing: 2,
                color: AppColors.grey,
                fontWeight: FontWeight.w400,
              ),
              helperText: 'Ask the member for their delivery OTP',
              helperStyle:
                  const TextStyle(fontSize: 12, color: AppColors.grey),
            ),
          ),
          const SizedBox(height: 24),

          // Photo section
          _SectionHeader(
              icon: Icons.camera_alt_outlined, title: 'Delivery Photo'),
          const SizedBox(height: 10),
          const Text(
            'Capture a photo of delivered goods',
            style: TextStyle(fontSize: 13, color: AppColors.grey),
          ),
          const SizedBox(height: 12),
          Obx(() => _PhotoGrid(
                photos: controller.photos
                    .map((p) => p.bytes)
                    .toList(),
                onAdd: controller.pickPhoto,
                onRemove: controller.removePhoto,
              )),
          const SizedBox(height: 100),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Obx(() {
            final enabled =
                controller.canConfirm && !controller.isLoading.value;
            return ElevatedButton(
              onPressed: enabled ? controller.confirmDelivery : null,
              style: ElevatedButton.styleFrom(
                backgroundColor:
                    enabled ? AppColors.green : AppColors.greyBorder,
              ),
              child: controller.isLoading.value
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.check_circle_outline_rounded),
                        const SizedBox(width: 8),
                        const Text('Confirm Delivery'),
                      ],
                    ),
            );
          }),
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final IconData icon;
  final String title;
  const _SectionHeader({required this.icon, required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppColors.green),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: Color(0xFF1A1A1A),
          ),
        ),
      ],
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final Order order;
  const _SummaryCard({required this.order});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.greenSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.green.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.receipt_long_rounded,
                  size: 18, color: AppColors.green),
              const SizedBox(width: 8),
              Text(
                'Order #${order.id}',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.greenDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _Row(label: 'Member', value: order.memberName),
          const SizedBox(height: 4),
          _Row(label: 'Items', value: '${order.items.length} items'),
          const SizedBox(height: 4),
          _Row(
              label: 'Total',
              value: '₹${order.totalAmount.toStringAsFixed(2)}'),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final String label;
  final String value;
  const _Row({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: 60,
          child: Text(
            label,
            style: const TextStyle(fontSize: 13, color: AppColors.grey),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1A1A1A),
            ),
          ),
        ),
      ],
    );
  }
}

class _PhotoGrid extends StatelessWidget {
  final List<dynamic> photos; // List<Uint8List>
  final VoidCallback onAdd;
  final void Function(int) onRemove;

  const _PhotoGrid(
      {required this.photos, required this.onAdd, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: [
        ...photos.asMap().entries.map(
              (e) => _PhotoTile(
                bytes: e.value,
                onRemove: () => onRemove(e.key),
              ),
            ),
        if (photos.length < 3)
          GestureDetector(
            onTap: onAdd,
            child: Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                color: AppColors.greenSurface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                    color: AppColors.green.withValues(alpha: 0.5), width: 1.5),
              ),
              child: const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.camera_alt_rounded,
                      color: AppColors.green, size: 28),
                  SizedBox(height: 4),
                  Text(
                    'Add Photo',
                    style: TextStyle(
                      fontSize: 11,
                      color: AppColors.green,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

class _PhotoTile extends StatelessWidget {
  final dynamic bytes;
  final VoidCallback onRemove;

  const _PhotoTile({required this.bytes, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: Image.memory(
            bytes,
            width: 90,
            height: 90,
            fit: BoxFit.cover,
          ),
        ),
        Positioned(
          top: 2,
          right: 2,
          child: GestureDetector(
            onTap: onRemove,
            child: Container(
              width: 22,
              height: 22,
              decoration: const BoxDecoration(
                color: Colors.red,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.close, color: Colors.white, size: 14),
            ),
          ),
        ),
      ],
    );
  }
}
