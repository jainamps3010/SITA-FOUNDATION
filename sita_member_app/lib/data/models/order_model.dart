class Order {
  final String id;
  final String orderNumber;
  final String status;
  final double totalAmount;
  final double sitaCommission;
  final double vendorAmount;
  final String paymentMethod;
  final String paymentStatus;
  final String deliveryAddress;
  final String? notes;
  final List<OrderItem> items;
  final OrderVendor? vendor;
  final DateTime createdAt;

  Order({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.totalAmount,
    required this.sitaCommission,
    required this.vendorAmount,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.deliveryAddress,
    this.notes,
    required this.items,
    this.vendor,
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) => Order(
        id: json['id'] ?? '',
        orderNumber: json['order_number'] ?? '',
        status: json['status'] ?? 'pending',
        totalAmount: double.tryParse(json['total_amount']?.toString() ?? '0') ?? 0.0,
        sitaCommission: double.tryParse(json['sita_commission']?.toString() ?? '0') ?? 0.0,
        vendorAmount: double.tryParse(json['vendor_amount']?.toString() ?? '0') ?? 0.0,
        paymentMethod: json['payment_method'] ?? 'bank_transfer',
        paymentStatus: json['payment_status'] ?? 'pending',
        deliveryAddress: json['delivery_address'] ?? '',
        notes: json['notes'],
        items: (json['items'] as List<dynamic>? ?? [])
            .map((e) => OrderItem.fromJson(e))
            .toList(),
        vendor: json['vendor'] != null ? OrderVendor.fromJson(json['vendor']) : null,
        createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      );

  String get statusLabel {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'dispatched': return 'Dispatched';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      case 'disputed': return 'Disputed';
      default: return status;
    }
  }
}

class OrderItem {
  final String id;
  final String productId;
  final String productName;
  final String productUnit;
  final int quantity;
  final double unitPrice;
  final double totalPrice;
  final double? marketPrice;
  // Populated only from the last-order endpoint (joined product details)
  final bool isUnavailable;
  final double? currentPrice;
  final double? currentMarketPrice;
  final int? moq;
  final int? stockQuantity;
  final String? imageUrl;
  final String? category;
  final String? vendorId;

  OrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.productUnit,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
    this.marketPrice,
    this.isUnavailable = false,
    this.currentPrice,
    this.currentMarketPrice,
    this.moq,
    this.stockQuantity,
    this.imageUrl,
    this.category,
    this.vendorId,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    final product = json['product'] as Map<String, dynamic>?;
    return OrderItem(
      id: json['id'] ?? '',
      productId: json['product_id'] ?? '',
      productName: json['product_name'] ?? '',
      productUnit: json['product_unit'] ?? 'unit',
      quantity: json['quantity'] ?? 0,
      unitPrice: double.tryParse(json['unit_price']?.toString() ?? '0') ?? 0.0,
      totalPrice: double.tryParse(json['total_price']?.toString() ?? '0') ?? 0.0,
      marketPrice: json['market_price'] != null
          ? double.tryParse(json['market_price'].toString())
          : null,
      isUnavailable: json['is_unavailable'] == true,
      currentPrice: product != null
          ? double.tryParse(product['price_per_unit']?.toString() ?? '')
          : null,
      currentMarketPrice: product != null
          ? double.tryParse(product['market_price']?.toString() ?? '')
          : null,
      moq: product?['moq'] is int ? product!['moq'] as int : null,
      stockQuantity: product?['stock_quantity'] is int ? product!['stock_quantity'] as int : null,
      imageUrl: product?['image_url'] as String?,
      category: product?['category'] as String?,
      vendorId: product?['vendor_id'] as String?,
    );
  }
}

class OrderVendor {
  final String id;
  final String companyName;
  final String? phone;
  final String? email;

  OrderVendor({required this.id, required this.companyName, this.phone, this.email});

  factory OrderVendor.fromJson(Map<String, dynamic> json) => OrderVendor(
        id: json['id'] ?? '',
        companyName: json['company_name'] ?? '',
        phone: json['phone'],
        email: json['email'],
      );
}
