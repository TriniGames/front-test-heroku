export default class EnumHelper {
  static typeName(type: string | null): string {
    switch (type) {
      case '1':
        return 'Damajuana';
      case '2':
        return 'Botella';
      case '3':
        return 'Otro';
      default:
        return '';
    }
  }
}
