import 'package:get/get.dart';
import 'marketplace_controller.dart';

class MarketplaceBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<MarketplaceController>(() => MarketplaceController());
  }
}
