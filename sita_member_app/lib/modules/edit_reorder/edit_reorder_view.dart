import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../app/theme/app_theme.dart';
import '../../data/models/order_model.dart';
import '../cart/cart_controller.dart';
import 'edit_reorder_controller.dart';

class EditReorderView extends GetView<EditReorderController> {
  const EditReorderView({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = Get.find<CartController>();
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Edit & Reorder'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Obx(() {
        final cartItems = cart.items;
        final unavailable = controller.unavailableItems;

        if (cartItems.isEmpty && unavailable.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.shopping_cart_outlined,
                      size: 72, color: AppColors.textSecondary),
                  const SizedBox(height: 16),
                  const Text('No items to reorder',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textSecondary)),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: controller.addMoreProducts,
                    icon: const Icon(Icons.add_shopping_cart),
                    label: const Text('Browse Marketplace'),
                  ),
                ],
              ),
            ),
          );
        }

        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
          children: [
            if (cartItems.isNotEmpty) ...[
              const _SectionHeader('Your Items'),
              const SizedBox(height: 10),
              ...cartItems.map(
                (ci) => _AvailableItemRow(
                  key: ValueKey(ci.product.id),
                  cartItem: ci,
                  cart: cart,
                ),
              ),
            ],
            if (unavailable.isNotEmpty) ...[
              const SizedBox(height: 20),
              const _SectionHeader('Out of Stock', secondary: true),
              const SizedBox(height: 10),
              ...unavailable.map((item) => _UnavailableItemRow(item: item)),
            ],
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: controller.addMoreProducts,
              icon: const Icon(Icons.add),
              label: const Text('Add More Products'),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        );
      }),
      bottomNavigationBar: _BottomSummary(
        cart: cart,
        onPlaceOrder: controller.goToCart,
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final bool secondary;
  const _SectionHeader(this.title, {this.secondary = false});

  @override
  Widget build(BuildContext context) => Text(
        title,
        style: TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w700,
          color: secondary ? AppColors.textSecondary : AppColors.textPrimary,
        ),
      );
}

class _AvailableItemRow extends StatelessWidget {
  final CartItem cartItem;
  final CartController cart;
  const _AvailableItemRow({super.key, required this.cartItem, required this.cart});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  cartItem.product.name,
                  style: const TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 14),
                ),
                const SizedBox(height: 3),
                Text(
                  '₹${cartItem.product.pricePerUnit.toStringAsFixed(0)} / ${cartItem.product.unit}',
                  style: const TextStyle(
                      color: AppColors.textSecondary, fontSize: 12),
                ),
                if (cartItem.product.moq > 1)
                  Text(
                    'Min: ${cartItem.product.moq} ${cartItem.product.unit}',
                    style: const TextStyle(
                        color: AppColors.textSecondary, fontSize: 11),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _QtyButton(
                icon: Icons.remove,
                onTap: () => cart.updateQty(
                    cartItem.product.id, cartItem.quantity - 1),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Text(
                  '${cartItem.quantity}',
                  style: const TextStyle(
                      fontWeight: FontWeight.w700, fontSize: 15),
                ),
              ),
              _QtyButton(
                icon: Icons.add,
                onTap: () => cart.updateQty(
                    cartItem.product.id, cartItem.quantity + 1),
              ),
              const SizedBox(width: 8),
              _RemoveButton(
                onTap: () => cart.removeItem(cartItem.product.id),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _QtyButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _QtyButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          width: 30,
          height: 30,
          decoration: BoxDecoration(
            color: AppColors.primaryLight,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 16, color: AppColors.primary),
        ),
      );
}

class _RemoveButton extends StatelessWidget {
  final VoidCallback onTap;
  const _RemoveButton({required this.onTap});

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: Colors.red.shade50,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(Icons.close, size: 16, color: Colors.red.shade700),
        ),
      );
}

class _UnavailableItemRow extends StatelessWidget {
  final OrderItem item;
  const _UnavailableItemRow({required this.item});

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.grey.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.productName,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${item.quantity} ${item.productUnit}',
                    style: const TextStyle(
                        color: AppColors.textSecondary, fontSize: 12),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                'Out of Stock',
                style: TextStyle(
                    fontSize: 11,
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      );
}

class _BottomSummary extends StatelessWidget {
  final CartController cart;
  final VoidCallback onPlaceOrder;
  const _BottomSummary({required this.cart, required this.onPlaceOrder});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (cart.items.isEmpty) return const SizedBox.shrink();
      return Container(
        padding: EdgeInsets.fromLTRB(
            20, 16, 20, MediaQuery.of(context).padding.bottom + 16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _row('Items Subtotal',
                '₹${cart.subtotal.toStringAsFixed(2)}'),
            const SizedBox(height: 4),
            _row('Foundation Fee (2%)',
                '₹${cart.foundationFee.toStringAsFixed(2)}'),
            const Divider(height: 16),
            _row('Total Payable', '₹${cart.total.toStringAsFixed(2)}',
                bold: true, large: true),
            const SizedBox(height: 14),
            ElevatedButton(
              onPressed: onPlaceOrder,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 52),
                backgroundColor: AppColors.secondary,
              ),
              child: const Text('Place Order',
                  style: TextStyle(
                      fontSize: 16, fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      );
    });
  }

  Widget _row(String label, String value,
      {bool bold = false, bool large = false}) {
    final style = TextStyle(
      fontSize: large ? 16 : 13,
      fontWeight: bold ? FontWeight.w700 : FontWeight.w400,
      color: bold ? AppColors.textPrimary : AppColors.textSecondary,
    );
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [Text(label, style: style), Text(value, style: style)],
    );
  }
}
