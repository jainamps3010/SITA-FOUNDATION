import 'package:get/get.dart';
import 'defect_report_controller.dart';

class DefectReportBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DefectReportController>(() => DefectReportController());
  }
}
