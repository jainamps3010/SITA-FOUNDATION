class Product {
  final String id;
  final String name;
  final String? description;
  final String category;
  final double pricePerUnit;
  final double? marketPrice;
  final String unit;
  final int moq;
  final bool available;
  final String? imageUrl;
  final Vendor? vendor;

  Product({
    required this.id,
    required this.name,
    this.description,
    required this.category,
    required this.pricePerUnit,
    this.marketPrice,
    required this.unit,
    required this.moq,
    required this.available,
    this.imageUrl,
    this.vendor,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        description: json['description'],
        category: json['category'] ?? '',
        pricePerUnit: double.tryParse(json['price_per_unit']?.toString() ?? '0') ?? 0.0,
        marketPrice: json['market_price'] != null
            ? double.tryParse(json['market_price'].toString())
            : null,
        unit: json['unit'] ?? 'unit',
        moq: json['moq'] ?? 1,
        available: json['available'] ?? true,
        imageUrl: json['image_url'],
        vendor: json['vendor'] != null ? Vendor.fromJson(json['vendor']) : null,
      );

  double get savings => (marketPrice ?? pricePerUnit) - pricePerUnit;
  double get savingsPercent =>
      marketPrice != null && marketPrice! > 0 ? (savings / marketPrice!) * 100 : 0;
}

class Vendor {
  final String id;
  final String companyName;
  final String? city;
  final String? state;
  final String? phone;
  final String? email;

  Vendor({
    required this.id,
    required this.companyName,
    this.city,
    this.state,
    this.phone,
    this.email,
  });

  factory Vendor.fromJson(Map<String, dynamic> json) => Vendor(
        id: json['id'] ?? '',
        companyName: json['company_name'] ?? '',
        city: json['city'],
        state: json['state'],
        phone: json['phone'],
        email: json['email'],
      );
}
