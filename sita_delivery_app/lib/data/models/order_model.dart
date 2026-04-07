class OrderItem {
  final int id;
  final String productName;
  final String unit;
  final int quantity;
  final double price;
  final double subtotal;

  OrderItem({
    required this.id,
    required this.productName,
    required this.unit,
    required this.quantity,
    required this.price,
    required this.subtotal,
  });

  factory OrderItem.fromJson(Map<String, dynamic> j) => OrderItem(
        id: j['id'] ?? 0,
        productName: j['product_name'] ?? j['productName'] ?? '',
        unit: j['unit'] ?? '',
        quantity: j['quantity'] ?? 0,
        price: (j['price'] ?? 0).toDouble(),
        subtotal: (j['subtotal'] ?? 0).toDouble(),
      );
}

class Order {
  final int id;
  final String status;
  final double totalAmount;
  final String deliveryAddress;
  final String memberName;
  final String memberPhone;
  final String? deliveryOtp;
  final List<OrderItem> items;
  final String createdAt;

  Order({
    required this.id,
    required this.status,
    required this.totalAmount,
    required this.deliveryAddress,
    required this.memberName,
    required this.memberPhone,
    this.deliveryOtp,
    required this.items,
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> j) {
    final itemsList = (j['items'] as List? ?? [])
        .map((i) => OrderItem.fromJson(i as Map<String, dynamic>))
        .toList();

    return Order(
      id: j['id'] ?? 0,
      status: j['status'] ?? 'pending',
      totalAmount: (j['total_amount'] ?? j['totalAmount'] ?? 0).toDouble(),
      deliveryAddress: j['delivery_address'] ?? j['deliveryAddress'] ?? '',
      memberName: j['member_name'] ?? j['memberName'] ?? 'Member',
      memberPhone: j['member_phone'] ?? j['memberPhone'] ?? '',
      deliveryOtp: j['delivery_otp']?.toString() ?? j['deliveryOtp']?.toString(),
      items: itemsList,
      createdAt: j['created_at'] ?? j['createdAt'] ?? '',
    );
  }

  String get statusLabel {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }
}
