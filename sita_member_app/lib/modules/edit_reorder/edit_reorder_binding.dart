import 'package:get/get.dart';
import 'edit_reorder_controller.dart';

class EditReorderBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<EditReorderController>(() => EditReorderController());
  }
}
