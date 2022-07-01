import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { HtmlCanvas } from '../../utils/html-canvas/html-canvas.utility';
import { loadImageFile } from '../../utils/image-file/image-file.utility';
import { MakeThumbnailImageResult, WH, XY } from './make-thumbnail-image.interface';

@Component({
  selector: 'app-make-thumbnail-image',
  templateUrl: './make-thumbnail-image.component.html',
  styleUrls: ['./make-thumbnail-image.component.scss'],
})
export class MakeThumbnailImageComponent implements OnChanges, AfterViewInit {
  readonly className = 'MakeThumbnailImageComponent';

  /** Status. */
  @Input() dialogMode: boolean = false;

  @Input() shown: boolean = false;

  /** Timer */
  timerId: any; // For interval timer control.

  /** Appearance. */
  @Input() styleClass = '';

  @Input() okLabel = 'OK';

  @Input() cancelLabel = 'Cancel';

  @Input() buttonStyleClass = '';

  /** Input image file. */
  @Input() inputFile!: File;

  inputImage?: any;

  /** Thumbnail and canvas size. */
  @Input() thumbSize: WH = { w: 160, h: 160 }; // px.

  margin: WH = { w: 50, h: 50 };

  canvasSize: WH = { w: this.thumbSize.w + this.margin.w * 2, h: this.thumbSize.h + this.margin.h * 2 };

  /** Image info. */
  imagePos: XY = { x: 0, y: 0 };

  scaledImageSize: WH = { w: 0, h: 0 };

  /** Canvas. */
  canvas?: HtmlCanvas;

  readonly canvasId = 'MakeThumbnailImage_Preview';

  /** Mouse */
  isMouseDragging = false;

  /** Scale factor. */
  @Input() imageScale = 100;

  /** Output. */
  @Output() thumbResult = new EventEmitter<MakeThumbnailImageResult>();

  thumbData?: Blob;

  //============================================================================
  // Class methods.
  //
  /**
   * Constructor. Nothing to do.
   * @param logger NGX logger instance injection.
   */
  constructor(private logger: NGXLogger) {
    this.logger.trace(`new ${this.className}()`);
  }

  /**
   * Lifecycle hook called on input parameter changes.
   * (1) Under the dialog mode, it init canvas element after the dialog is shown.
   * (2) It loads input image.
   * @param changes Change information of input parameters.
   */
  ngOnChanges(changes: SimpleChanges): void {
    const location = `${this.className}.ngOnChanges()`;

    // CASE: The shown flag is changed.
    // If it's in dialog mode, start interval to get canvas.
    if (changes['shown']) {
      this.logger.trace(location, 'shown', this.shown);
      const shownChange = changes['shown'];
      if (shownChange.previousValue === false && shownChange.currentValue === true) {
        if (this.dialogMode) {
          this.timerId = setInterval(() => {
            this.canvas = HtmlCanvas.createCanvas(this.canvasId);
            if (this.canvas) {
              clearInterval(this.timerId);
              this.initCanvas(this.canvas);
            } else {
              this.logger.info(location, 'Canvas is not ready.');
            }
          }, 200);
        }
      }
      if (shownChange.previousValue === true && shownChange.currentValue === false) {
        clearInterval(this.timerId);
      }
    }

    // CASE: The source image file is changed.
    // It load input source image.
    if (changes['inputFile']) {
      this.logger.trace(location, 'inputFile');
      if (this.inputFile) {
        this.loadImage(this.inputFile);
      }
    }
  }

  /**
   * Lifecycle hook called on view is initialized.
   * If it is normal page (not dialog), canvas is available after view is initialized.
   */
  ngAfterViewInit(): void {
    if (!this.dialogMode) {
      this.canvas = HtmlCanvas.createCanvas(this.canvasId);
      if (this.canvas) {
        this.initCanvas(this.canvas);
      }
    }
  }

  /**
   * Event handler of the image scale input.
   * It calculate image position and image size after scaling.
   * @param event Number input event.
   */
  onImageScaleInputChange(event: any) {
    // Calculate image position.
    this.imagePos = this.calcScaledImagePos(event.value, this.scaledImageSize, this.imagePos);

    // Calculate scaled image size.
    this.scaledImageSize = this.calcScaledImageSize(event.value);

    if (this.inputImage) {
      this.draw();
    }
  }

  /**
   * OK button click event handler.
   * It makes thumbnail image and returns it to the parent component.
   */
  onOkClick() {
    const location = `${this.className}.onOkClick()`;
    this.logger.trace(location);

    this.makeThumbnailImageData();

    this.thumbResult.emit({ canceled: false, thumb: this.thumbData });
  }

  /**
   * Cancel button click event handler.
   * It returns the canceled flag.
   */
  onCancelClick() {
    const location = `${this.className}.onCancelClick()`;
    this.logger.trace(location);

    this.thumbResult.emit({ canceled: true });
  }

  //============================================================================
  // Private methods.
  //
  //----------------------------------------------------------------------------
  // Set up functions.
  //
  private initCanvas(canvas: HtmlCanvas) {
    const location = `${this.className}.initCanvas()`;
    this.logger.trace(location);

    // Set canvas size.
    canvas.width = this.canvasSize.w;
    canvas.height = this.canvasSize.h;

    // Register event listener.
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    canvas.addEventListener('mouseout', this.onMouseOut.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));

    // Draw if image is also available.
    if (this.inputImage) {
      this.onImageScaleInputChange({ value: this.imageScale });
      this.draw();
    }
  }

  private loadImage(inputFile: File) {
    const promise = loadImageFile(inputFile);
    promise.then((result) => {
      this.inputImage = result;
      this.imagePos.x = (this.canvasSize.w - this.inputImage.width) / 2;
      this.scaledImageSize = this.calcScaledImageSize(100);
      if (this.canvas) {
        this.onImageScaleInputChange({ value: this.imageScale });
        this.draw();
      }
    });
  }

  //----------------------------------------------------------------------------
  // Drawing methods.
  //
  private draw() {
    if (this.canvas) {
      this.canvas.clear();
      this.drawImage();
      this.drawMarginFrame();
      this.drawCenterLine();
    }
  }

  private drawImage() {
    if (this.canvas) {
      this.canvas.drawImage(
        this.inputImage,
        this.imagePos.x,
        this.imagePos.y,
        this.scaledImageSize.w,
        this.scaledImageSize.h
      );
    }
  }

  /**
   * Fill margin area with transparent color.
   * Margin area is separated four rectangles like below.
   * +-----------------+
   * |        1        |
   * +---+---------+---+
   * |   |         |   |
   * | 2 |         | 3 |
   * |   |         |   |
   * +---+---------+---+
   * |        4        |
   * +-----------------+
   */
  private drawMarginFrame() {
    if (this.canvas) {
      this.canvas.fillStyle = 'rgba(128, 128, 128, 0.5)'; // 50% gray.
      this.canvas.drawRect(0, 0, this.canvasSize.w, this.margin.h);
      this.canvas.drawRect(0, this.margin.h, this.margin.w, this.canvasSize.h - this.margin.h * 2);
      this.canvas.drawRect(this.canvasSize.w - this.margin.w, this.margin.h, this.margin.w, this.canvasSize.h - this.margin.h * 2); // eslint-disable-line
      this.canvas.drawRect(0, this.canvasSize.h - this.margin.h, this.canvasSize.w, this.margin.h);
    }
  }

  private drawCenterLine() {
    if (this.canvas) {
      this.canvas.strokeStyle = 'rgba(0, 0, 255, 0.5)'; // 50% Blue.
      this.canvas.drawLine(0, Math.ceil(this.canvasSize.h / 2), this.canvasSize.w, Math.ceil(this.canvasSize.h / 2));
      this.canvas.drawLine(Math.ceil(this.canvasSize.w / 2), 0, Math.ceil(this.canvasSize.w / 2), this.canvasSize.h);
    }
  }

  //----------------------------------------------------------------------------
  // Mouse event handlers.
  //
  private onMouseDown() {
    this.isMouseDragging = true;
  }

  private onMouseUp() {
    this.isMouseDragging = false;
  }

  private onMouseOut() {
    this.isMouseDragging = false;
  }

  private onMouseMove(event: MouseEvent) {
    if (this.isMouseDragging) {
      this.imagePos.x += event.movementX;
      this.imagePos.y += event.movementY;
      this.draw();
    }
  }

  //----------------------------------------------------------------------------
  // Image scaling.
  //
  private calcScaledImageSize(scale: number): WH {
    const width = Math.ceil((this.inputImage.width * scale) / 100);
    const height = Math.ceil((this.inputImage.height * scale) / 100);

    return { w: width, h: height };
  }

  private calcScaledImagePos(scale: number, size: WH, pos: XY): XY {
    const centerX = this.canvasSize.w / 2 - pos.x;
    const centerY = this.canvasSize.h / 2 - pos.y;
    const rateX = centerX / size.w;
    const rateY = centerY / size.h;
    const scaledWH = this.calcScaledImageSize(scale);
    const scaledCenterX = Math.ceil(scaledWH.w * rateX);
    const scaledCenterY = Math.ceil(scaledWH.h * rateY);
    return { x: this.canvasSize.w / 2 - scaledCenterX, y: this.canvasSize.h / 2 - scaledCenterY };
  }

  //----------------------------------------------------------------------------
  // Making output data.
  //
  private makeThumbnailImageData() {
    const location = `${this.className}.makeThumbnailImageData()`;

    // Make dummy canvas to crop image.
    const tmpCanvas = document.createElement('canvas');
    if (!tmpCanvas) {
      this.logger.error(location, 'Temporary canvas is not available.');
      return;
    }
    const context = tmpCanvas.getContext('2d');
    if (!context) {
      this.logger.error(location, 'Context is not avaiable.');
      return;
    }

    // Set temporary canvas size.
    tmpCanvas.width = this.thumbSize.w;
    tmpCanvas.height = this.thumbSize.h;

    // Fill canvas with white color.
    context.fillStyle = 'rgba(255, 255, 255, 1)';
    context.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);

    // Draw image to temporary canvas.
    const posX = this.imagePos.x - this.margin.w;
    const posY = this.imagePos.y - this.margin.h;
    context.drawImage(this.inputImage, posX, posY, this.scaledImageSize.w, this.scaledImageSize.h);

    // Get image data.
    const base64 = tmpCanvas.toDataURL('image/jpeg');
    const bin = atob(base64.split('base64,')[1]);
    let binaryData = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      binaryData[i] = bin.charCodeAt(i);
    }

    this.thumbData = new Blob([binaryData], { type: 'image/jpeg' });
    return;
  }
}
