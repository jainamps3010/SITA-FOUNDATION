import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../app/theme/app_theme.dart';
import '../../app/routes/app_routes.dart';
import '../../widgets/common_widgets.dart';
import '../cart/cart_controller.dart';
import 'product_detail_controller.dart';

class ProductDetailView extends GetView<ProductDetailController> {
  const ProductDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Obx(() => Text(controller.product.value?.name ?? 'Product')),
        automaticallyImplyLeading: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          Obx(() {
            final count = Get.find<CartController>().count;
            return Stack(
              children: [
                IconButton(
                  onPressed: () => Get.toNamed(Routes.cart),
                  icon: const Icon(Icons.shopping_cart_outlined),
                ),
                if (count > 0)
                  Positioned(
                    right: 6,
                    top: 6,
                    child: Container(
                      width: 18,
                      height: 18,
                      decoration: const BoxDecoration(
                          color: AppColors.accent, shape: BoxShape.circle),
                      child: Center(
                        child: Text('$count',
                            style: const TextStyle(
                                fontSize: 10, fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ),
              ],
            );
          }),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value && controller.product.value == null) {
          return const LoadingWidget();
        }
        final p = controller.product.value;
        if (p == null) return const SizedBox.shrink();

        return SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product image
              Container(
                width: double.infinity,
                height: 220,
                color: AppColors.primary.withValues(alpha: 0.07),
                child: p.imageUrl != null
                    ? Image.network(p.imageUrl!, fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => _categoryIcon(p.category))
                    : _categoryIcon(p.category),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Name & category
                    Row(
                      children: [
                        Expanded(
                          child: Text(p.name,
                              style: const TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary)),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            p.category,
                            style: const TextStyle(
                                color: AppColors.primary,
                                fontSize: 12,
                                fontWeight: FontWeight.w500),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    if (p.vendor != null)
                      Text(
                        'by ${p.vendor!.companyName}${p.vendor!.city != null ? ', ${p.vendor!.city}' : ''}',
                        style: const TextStyle(
                            color: AppColors.textSecondary, fontSize: 13),
                      ),
                    const SizedBox(height: 16),
                    // Pricing
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                            color: AppColors.primary.withValues(alpha: 0.15)),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Market Price',
                                  style: TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 13)),
                              if (p.marketPrice != null)
                                Text(
                                  '₹${p.marketPrice!.toStringAsFixed(2)}/${p.unit}',
                                  style: const TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 14,
                                    decoration: TextDecoration.lineThrough,
                                  ),
                                )
                              else
                                const Text('—',
                                    style: TextStyle(
                                        color: AppColors.textSecondary)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('SITA Special Price',
                                  style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 14,
                                      color: AppColors.textPrimary)),
                              Text(
                                '₹${p.pricePerUnit.toStringAsFixed(2)}/${p.unit}',
                                style: const TextStyle(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 18),
                              ),
                            ],
                          ),
                          if (p.savingsPercent > 0) ...[
                            const Divider(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Your Savings',
                                    style: TextStyle(
                                        color: AppColors.success,
                                        fontWeight: FontWeight.w500,
                                        fontSize: 13)),
                                Text(
                                  '₹${p.savings.toStringAsFixed(2)} (${p.savingsPercent.toStringAsFixed(0)}% off)',
                                  style: const TextStyle(
                                      color: AppColors.success,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    // Details
                    if (p.description != null && p.description!.isNotEmpty) ...[
                      const Text('Description',
                          style: TextStyle(
                              fontWeight: FontWeight.w600, fontSize: 15)),
                      const SizedBox(height: 8),
                      Text(p.description!,
                          style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 14,
                              height: 1.5)),
                      const SizedBox(height: 16),
                    ],
                    // Bulk / MOQ info
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.divider),
                      ),
                      child: Column(
                        children: [
                          _detailRow(Icons.inventory_2_outlined, 'Unit',
                              p.unit),
                          _detailRow(Icons.production_quantity_limits,
                              'Minimum Order', '${p.moq} ${p.unit}'),
                          if (p.vendor?.city != null)
                            _detailRow(Icons.location_on_outlined, 'Source',
                                '${p.vendor!.city}, ${p.vendor!.state ?? ''}'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Quantity selector
                    const Text('Select Quantity',
                        style: TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 15)),
                    const SizedBox(height: 12),
                    Obx(() => Row(
                          children: [
                            _qtyBtn(Icons.remove, () => controller.decrement()),
                            Expanded(
                              child: Container(
                                margin: const EdgeInsets.symmetric(
                                    horizontal: 12),
                                padding: const EdgeInsets.symmetric(
                                    vertical: 12),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border:
                                      Border.all(color: AppColors.divider),
                                ),
                                child: Column(
                                  children: [
                                    Text(
                                      '${controller.quantity.value}',
                                      style: const TextStyle(
                                          fontSize: 22,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.textPrimary),
                                    ),
                                    Text(
                                      p.unit,
                                      style: const TextStyle(
                                          color: AppColors.textSecondary,
                                          fontSize: 12),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            _qtyBtn(Icons.add, () => controller.increment()),
                          ],
                        )),
                    const SizedBox(height: 12),
                    Obx(() => Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.05),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total Amount',
                                  style: TextStyle(
                                      fontWeight: FontWeight.w500)),
                              Text(
                                '₹${(p.pricePerUnit * controller.quantity.value).toStringAsFixed(2)}',
                                style: const TextStyle(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 18),
                              ),
                            ],
                          ),
                        )),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: controller.addToCart,
                      icon: const Icon(Icons.add_shopping_cart),
                      label: const Text('Add to Cart'),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: () => Get.toNamed(Routes.cart),
                      child: const Text('View Cart'),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ],
          ),
        );
      }),
    );
  }

  Widget _detailRow(IconData icon, String label, String value) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            Icon(icon, color: AppColors.primary, size: 18),
            const SizedBox(width: 10),
            Text(label,
                style: const TextStyle(
                    color: AppColors.textSecondary, fontSize: 13)),
            const Spacer(),
            Text(value,
                style: const TextStyle(
                    fontWeight: FontWeight.w500, fontSize: 13)),
          ],
        ),
      );

  Widget _qtyBtn(IconData icon, VoidCallback onTap) => GestureDetector(
        onTap: onTap,
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: AppColors.primary,
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: Colors.white, size: 20),
        ),
      );

  Widget _categoryIcon(String cat) => Center(
        child: Icon(Icons.inventory_2_outlined,
            color: AppColors.primary.withValues(alpha: 0.4), size: 80),
      );
}
