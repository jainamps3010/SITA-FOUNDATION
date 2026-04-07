import 'package:flutter_test/flutter_test.dart';
import 'package:sita_delivery_app/main.dart';

void main() {
  testWidgets('App widget exists', (WidgetTester tester) async {
    await tester.pumpWidget(const SitaDeliveryApp());
    expect(find.byType(SitaDeliveryApp), findsOneWidget);
  });
}
