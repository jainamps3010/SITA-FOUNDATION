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

  OrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.productUnit,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
    this.marketPrice,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) => OrderItem(
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
      );
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
