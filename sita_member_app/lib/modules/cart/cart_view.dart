import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../app/theme/app_theme.dart';
import '../../widgets/common_widgets.dart';
import 'cart_controller.dart';

class CartView extends GetView<CartController> {
  const CartView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const SitaAppBar(title: 'My Cart'),
      body: Obx(() {
        if (controller.items.isEmpty) {
          return const EmptyWidget(
            message: 'Your cart is empty.\nAdd products from the marketplace.',
            icon: Icons.shopping_cart_outlined,
          );
        }
        return Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Items
                  ...controller.items.map((item) => _CartItemCard(item: item)),
                  const SizedBox(height: 16),
                  // Delivery address
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.divider),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Delivery Address',
                            style: TextStyle(
                                fontWeight: FontWeight.w600, fontSize: 15)),
                        const SizedBox(height: 10),
                        TextField(
                          controller: controller.deliveryAddress,
                          maxLines: 2,
                          decoration: const InputDecoration(
                            hintText: 'Enter full delivery address',
                            prefixIcon: Icon(Icons.location_on_outlined,
                                color: AppColors.primary),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Payment method
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.divider),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Payment Method',
                            style: TextStyle(
                                fontWeight: FontWeight.w600, fontSize: 15)),
                        const SizedBox(height: 8),
                        Obx(() => Column(
                              children: [
                                _payMethod('bank_transfer', 'Bank Transfer',
                                    Icons.account_balance_outlined),
                                _payMethod(
                                    'upi', 'UPI', Icons.smartphone_outlined),
                                _payMethod('wallet', 'SITA Wallet',
                                    Icons.account_balance_wallet_outlined),
                              ],
                            )),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Bill summary
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.divider),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Bill Summary',
                            style: TextStyle(
                                fontWeight: FontWeight.w600, fontSize: 15)),
                        const SizedBox(height: 12),
                        Obx(() => Column(
                              children: [
                                _billRow(
                                  'Items Subtotal',
                                  '₹${controller.subtotal.toStringAsFixed(2)}',
                                  note: 'At SITA special prices',
                                ),
                                _billRow(
                                  'Foundation Fee (2%)',
                                  '₹${controller.foundationFee.toStringAsFixed(2)}',
                                  note: '2% of market value — non-refundable',
                                ),
                                const Divider(height: 16),
                                _billRow(
                                  'Total Payable',
                                  '₹${controller.total.toStringAsFixed(2)}',
                                  bold: true,
                                ),
                              ],
                            )),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Terms
                  Obx(() => GestureDetector(
                        onTap: () => controller.acceptedTerms.value =
                            !controller.acceptedTerms.value,
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: controller.acceptedTerms.value
                                ? AppColors.success.withValues(alpha: 0.05)
                                : Colors.orange.shade50,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: controller.acceptedTerms.value
                                  ? AppColors.success.withValues(alpha: 0.3)
                                  : Colors.orange.shade200,
                            ),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(
                                controller.acceptedTerms.value
                                    ? Icons.check_box
                                    : Icons.check_box_outline_blank,
                                color: controller.acceptedTerms.value
                                    ? AppColors.success
                                    : Colors.orange.shade600,
                                size: 22,
                              ),
                              const SizedBox(width: 10),
                              const Expanded(
                                child: Text(
                                  'I understand that the 2% Foundation Fee is non-refundable. Orders once placed cannot be cancelled without penalty as per SITA Foundation policy.',
                                  style: TextStyle(
                                      fontSize: 12,
                                      height: 1.4,
                                      color: AppColors.textSecondary),
                                ),
                              ),
                            ],
                          ),
                        ),
                      )),
                  const SizedBox(height: 16),
                ],
              ),
            ),
            // Place Order button
            Container(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
              decoration: const BoxDecoration(
                color: Colors.white,
                border:
                    Border(top: BorderSide(color: AppColors.divider)),
              ),
              child: Obx(() => ElevatedButton(
                    onPressed: controller.isLoading.value ? null : controller.placeOrder,
                    child: controller.isLoading.value
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2))
                        : Text(
                            'Place Order  •  ₹${controller.total.toStringAsFixed(2)}'),
                  )),
            ),
          ],
        );
      }),
    );
  }

  Widget _payMethod(String value, String label, IconData icon) {
    final selected = controller.paymentMethod.value == value;
    return GestureDetector(
      onTap: () => controller.paymentMethod.value = value,
      child: Container(
        margin: const EdgeInsets.only(bottom: 6),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary.withValues(alpha: 0.05) : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: selected ? AppColors.primary : AppColors.divider,
          ),
        ),
        child: Row(
          children: [
            Icon(icon,
                color: selected ? AppColors.primary : AppColors.textSecondary,
                size: 20),
            const SizedBox(width: 10),
            Text(label,
                style: TextStyle(
                    color: selected ? AppColors.primary : AppColors.textPrimary,
                    fontWeight: selected ? FontWeight.w600 : FontWeight.normal)),
            const Spacer(),
            if (selected)
              const Icon(Icons.check_circle, color: AppColors.primary, size: 18),
          ],
        ),
      ),
    );
  }

  Widget _billRow(String label, String value, {bool bold = false, String? note}) =>
      Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: TextStyle(
                        fontWeight: bold ? FontWeight.w700 : FontWeight.normal,
                        fontSize: bold ? 15 : 13,
                        color: bold ? AppColors.textPrimary : AppColors.textSecondary)),
                if (note != null)
                  Text(note,
                      style: const TextStyle(
                          color: AppColors.error, fontSize: 10)),
              ],
            ),
            Text(value,
                style: TextStyle(
                    fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
                    fontSize: bold ? 16 : 13,
                    color: bold ? AppColors.primary : AppColors.textPrimary)),
          ],
        ),
      );
}

class _CartItemCard extends StatelessWidget {
  final CartItem item;
  const _CartItemCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final ctrl = Get.find<CartController>();
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.07),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.inventory_2_outlined,
                color: AppColors.primary, size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.product.name,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 14),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text(
                    '₹${item.product.pricePerUnit.toStringAsFixed(2)}/${item.product.unit}',
                    style: const TextStyle(
                        color: AppColors.textSecondary, fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('₹${item.total.toStringAsFixed(2)}',
                  style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w700,
                      fontSize: 15)),
              const SizedBox(height: 6),
              Row(
                children: [
                  _btn(Icons.remove, () {
                    ctrl.updateQty(item.product.id, item.quantity - 1);
                  }),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    child: Text('${item.quantity}',
                        style: const TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 15)),
                  ),
                  _btn(Icons.add, () {
                    ctrl.updateQty(item.product.id, item.quantity + 1);
                  }),
                  const SizedBox(width: 6),
                  GestureDetector(
                    onTap: () => ctrl.removeItem(item.product.id),
                    child: const Icon(Icons.delete_outline,
                        color: AppColors.error, size: 20),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _btn(IconData icon, VoidCallback onTap) => GestureDetector(
        onTap: onTap,
        child: Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.divider),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Icon(icon, size: 16),
        ),
      );
}
