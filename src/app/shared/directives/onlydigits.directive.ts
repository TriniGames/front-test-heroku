import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appOnlydigits]',
})
export class OnlydigitsDirective {
  decimalSeparator = '.';
  previousValue = '';
  integerUnsigned = '^[0-9]*$';
  integerSigned = '^-?[0-9]+$';

  constructor(private hostElement: ElementRef) {}

  @HostListener('change', ['$event']) onChange(e: any) {
    this.validateValue(this.hostElement.nativeElement.value);
  }

  /**
   * Event handler for host's paste event
   * @param e
   */
  @HostListener('paste', ['$event']) onPaste(e: any) {
    // get and validate data from clipboard
    const value = e.clipboardData.getData('text/plain');
    this.validateValue(value);
    e.preventDefault();
  }

  /**
   * Event handler for host's keydown event
   * @param event
   */
  @HostListener('keydown', ['$event']) onKeyDown(e: any) {
    const cursorPosition: number = e.target['selectionStart'];
    const originalValue: string = e.target['value'];
    const key: string = e.key;
    const controlOrCommand = e.ctrlKey === true || e.metaKey === true;
    const signExists = originalValue.includes('-');

    // allowed keys apart from numeric characters
    const allowedKeys = [
      'Backspace',
      'ArrowLeft',
      'ArrowRight',
      'Escape',
      'Tab',
    ];

    // when minus sign is allowed, add its
    // key to allowed key only when the
    // cursor is in the first position, and
    // first character is different from
    // decimal separator
    const firstCharacterIsSeparator =
      originalValue.charAt(0) !== this.decimalSeparator;
    if (!signExists && firstCharacterIsSeparator && cursorPosition === 0) {
      allowedKeys.push('-');
    }

    // allow some non-numeric characters
    if (
      allowedKeys.indexOf(key) !== -1 ||
      // Allow: Ctrl+A and Command+A
      (key === 'a' && controlOrCommand) ||
      // Allow: Ctrl+C and Command+C
      (key === 'c' && controlOrCommand) ||
      // Allow: Ctrl+V and Command+V
      (key === 'v' && controlOrCommand) ||
      // Allow: Ctrl+X and Command+X
      (key === 'x' && controlOrCommand)
    ) {
      // let it happen, don't do anything
      return;
    }

    // save value before keydown event
    this.previousValue = originalValue;

    // allow number characters only
    const isNumber = new RegExp(this.integerUnsigned).test(key);
    if (isNumber) {
      return;
    } else {
      e.preventDefault();
    }
  }

  /**
   * Test whether value is a valid number or not
   * @param value
   */
  validateValue(value: string): void {
    // when a numbers begins with a decimal separator,
    // fix it adding a zero in the beginning
    const firstCharacter = value.charAt(0);
    if (firstCharacter === this.decimalSeparator) {
      value = 0 + value;
    }

    // when a numbers ends with a decimal separator,
    // fix it adding a zero in the end
    const lastCharacter = value.charAt(value.length - 1);
    if (lastCharacter === this.decimalSeparator) {
      value = value + 0;
    }

    // test number with regular expression, when
    // number is invalid, replace it with a zero
    const valid: boolean = new RegExp(this.integerSigned).test(value);
    this.hostElement.nativeElement.value = valid ? value : 0;
  }
}
