import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../app/theme/app_theme.dart';
import '../../app/routes/app_routes.dart';
import '../../data/models/product_model.dart';
import '../../widgets/common_widgets.dart';
import '../cart/cart_controller.dart';
import 'marketplace_controller.dart';

class MarketplaceView extends GetView<MarketplaceController> {
  const MarketplaceView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Marketplace'),
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
      body: Column(
        children: [
          _buildSearch(),
          _buildCategories(),
          Expanded(child: _buildProducts()),
        ],
      ),
    );
  }

  Widget _buildSearch() => Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
        child: TextField(
          controller: controller.searchCtrl,
          decoration: InputDecoration(
            hintText: 'Search products...',
            prefixIcon:
                const Icon(Icons.search, color: AppColors.textSecondary),
            suffixIcon: IconButton(
              icon: const Icon(Icons.clear, color: AppColors.textSecondary),
              onPressed: () {
                controller.searchCtrl.clear();
                controller.fetchProducts();
              },
            ),
          ),
          onSubmitted: (_) => controller.fetchProducts(),
        ),
      );

  Widget _buildCategories() => SizedBox(
        height: 48,
        child: Obx(() => ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              itemCount: controller.categories.length,
              itemBuilder: (_, i) {
                final cat = controller.categories[i];
                final selected = controller.selectedCategory.value == cat ||
                    (cat == 'All' && controller.selectedCategory.value.isEmpty);
                return GestureDetector(
                  onTap: () => controller.selectCategory(cat == 'All' ? '' : cat),
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    decoration: BoxDecoration(
                      color: selected ? AppColors.primary : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: selected ? AppColors.primary : AppColors.divider,
                      ),
                    ),
                    child: Text(
                      cat[0].toUpperCase() + cat.substring(1),
                      style: TextStyle(
                        color: selected ? Colors.white : AppColors.textSecondary,
                        fontSize: 13,
                        fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
                      ),
                    ),
                  ),
                );
              },
            )),
      );

  Widget _buildProducts() => Obx(() {
        if (controller.isLoading.value) return const LoadingWidget();
        if (controller.products.isEmpty) {
          return const EmptyWidget(
            message: 'No products found.\nTry a different category or search.',
            icon: Icons.inventory_2_outlined,
          );
        }
        return RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () => controller.fetchProducts(),
          child: GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.72,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: controller.products.length,
            itemBuilder: (_, i) =>
                _ProductCard(product: controller.products[i]),
          ),
        );
      });
}

class _ProductCard extends StatelessWidget {
  final Product product;
  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Get.toNamed(Routes.productDetail, arguments: product),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.divider),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image / category icon
            Container(
              height: 110,
              width: double.infinity,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.07),
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: product.imageUrl != null
                  ? ClipRRect(
                      borderRadius: const BorderRadius.vertical(
                          top: Radius.circular(16)),
                      child: Image.network(product.imageUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              _categoryIcon(product.category)),
                    )
                  : _categoryIcon(product.category),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                          color: AppColors.textPrimary),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    if (product.marketPrice != null && product.marketPrice! > product.pricePerUnit)
                      Text(
                        '₹${product.marketPrice!.toStringAsFixed(0)}/${product.unit}',
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 11,
                          decoration: TextDecoration.lineThrough,
                        ),
                      ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Text(
                          '₹${product.pricePerUnit.toStringAsFixed(2)}',
                          style: const TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w700,
                              fontSize: 14),
                        ),
                        Text(
                          '/${product.unit}',
                          style: const TextStyle(
                              color: AppColors.textSecondary, fontSize: 11),
                        ),
                      ],
                    ),
                    const Spacer(),
                    if (product.savingsPercent > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.success.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '${product.savingsPercent.toStringAsFixed(0)}% off',
                          style: const TextStyle(
                              color: AppColors.success,
                              fontSize: 10,
                              fontWeight: FontWeight.w600),
                        ),
                      ),
                    const SizedBox(height: 4),
                    Text(
                      'Min: ${product.moq} ${product.unit}',
                      style: const TextStyle(
                          color: AppColors.textSecondary, fontSize: 10),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _categoryIcon(String cat) => Center(
        child: Icon(
          _iconForCategory(cat),
          color: AppColors.primary.withOpacity(0.5),
          size: 48,
        ),
      );

  IconData _iconForCategory(String cat) {
    switch (cat.toLowerCase()) {
      case 'grains': return Icons.grain;
      case 'pulses': return Icons.spa_outlined;
      case 'spices': return Icons.local_fire_department_outlined;
      case 'oils': return Icons.water_drop_outlined;
      case 'dairy': return Icons.emoji_food_beverage_outlined;
      case 'vegetables': return Icons.eco_outlined;
      case 'beverages': return Icons.local_cafe_outlined;
      case 'cleaning': return Icons.cleaning_services_outlined;
      default: return Icons.inventory_2_outlined;
    }
  }
}
