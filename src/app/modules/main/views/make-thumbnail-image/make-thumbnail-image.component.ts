import { AfterViewChecked, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { MakeThumbnailImageResult, WH, XY } from './make-thumbnail-image.interface';

@Component({
  selector: 'app-make-thumbnail-image',
  templateUrl: './make-thumbnail-image.component.html',
  styleUrls: ['./make-thumbnail-image.component.scss'],
})
export class MakeThumbnailImageComponent implements OnChanges, AfterViewChecked {
  className = 'MakeThumbnailImageComponent';

  /** Appearance. */
  @Input() okLabel = 'OK';

  @Input() cancelLabel = 'Cancel';

  @Input() buttonStyleClass = '';

  /** Input image file. */
  @Input() inputFile!: File;

  inputImage = new Image();

  isImageLoaded = false;

  /** Thumbnail and canvas size. */
  @Input() thumbSize: WH = { w: 200, h: 200 }; // px.

  margin: WH = { w: 50, h: 50 };

  canvasSize: WH = { w: this.thumbSize.w + this.margin.w * 2, h: this.thumbSize.h + this.margin.h * 2 };

  /** Image info. */
  imagePos: XY = { x: 0, y: 0 };

  scaledImageSize: WH = { w: 0, h: 0 };

  /** Canvas. */
  canvas?: HTMLCanvasElement;

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
  constructor(private logger: NGXLogger) {
    this.logger.trace(`new ${this.className}()`);
  }

  ngOnChanges() {
    const location = `${this.className}.ngOnChanges()`;
    this.logger.trace(location);

    if (!this.inputFile) {
      return;
    }

    // Update scale info.
    //this.onImageScaleInputChange({ value: this.imageScale });

    // Load image data.
    this.loadImage(this.inputFile);
  }

  ngAfterViewChecked() {
    const location = `${this.className}.ngAfterViewChecked()`;

    if (!this.canvas) {
      this.canvas = document.getElementById('MakeThumbnailImage_Preview') as HTMLCanvasElement;
      if (this.canvas) {
        this.logger.info(location, 'Canvas is initialized.');
        this.canvas.width = this.canvasSize.w;
        this.canvas.height = this.canvasSize.h;
        if (this.isImageLoaded) {
          this.onImageScaleInputChange({ value: this.imageScale });
          this.draw();
        }

        // Register event listener.
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mouseout', this.onMouseOut.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
      }
    }
  }

  onImageScaleInputChange(event: any) {
    const location = `${this.className}.onImageScaleInputChange()`;
    this.logger.trace(location, { value: event.value });

    // Calculate image position.
    this.imagePos = this.calcScaledImagePos(event.value, this.scaledImageSize, this.imagePos);

    // Calculate scaled image size.
    this.scaledImageSize = this.calcScaledImageSize(event.value);

    if (this.isImageLoaded) {
      this.draw();
    }
  }

  onOkClick() {
    const location = `${this.className}.onOkClick()`;
    this.logger.trace(location);

    this.makeThumbnailImageData();

    this.thumbResult.emit({ canceled: false, thumb: this.thumbData });
  }

  onCancelClick() {
    const location = `${this.className}.onCancelClick()`;
    this.logger.trace(location);

    this.thumbResult.emit({ canceled: true });
  }

  //============================================================================
  // Private methods.
  //
  private loadImage(inputFile: File) {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.inputImage.src = fileReader.result as string;
      this.inputImage.onload = () => {
        this.imagePos.x = (this.canvasSize.w - this.inputImage.width) / 2;
        this.isImageLoaded = true;
        this.scaledImageSize = this.calcScaledImageSize(100);

        if (this.canvas) {
          this.onImageScaleInputChange({ value: this.imageScale });
          this.draw();
        }
      };
    };
    fileReader.readAsDataURL(inputFile);
  }

  private draw() {
    const location = `${this.className}.draw()`;

    if (this.canvas) {
      const context = this.canvas.getContext('2d');
      if (!context) {
        this.logger.error(location, 'Canvas context is not available.');
        return;
      }
      this.clearCanvas(context);
      this.drawImage(context);
      this.drawMarginFrame(context);
      this.drawCenterLine(context);
    }
  }

  private clearCanvas(context: CanvasRenderingContext2D) {
    context.clearRect(0, 0, this.canvasSize.w, this.canvasSize.h);
  }

  private drawImage(context: CanvasRenderingContext2D) {
    const location = `${this.className}.drawImage()`;

    context.drawImage(
      this.inputImage,
      this.imagePos.x,
      this.imagePos.y,
      this.scaledImageSize.w,
      this.scaledImageSize.h
    );
    this.logger.debug(location, { width: this.inputImage.width, height: this.inputImage.height }, this.scaledImageSize);
  }

  private drawMarginFrame(context: CanvasRenderingContext2D) {
    // Set color.
    // 50% transparent gray.
    context.fillStyle = 'rgba(128, 128, 128, 0.5)';
    context.fillRect(0, 0, this.canvasSize.w, this.margin.h);
    context.fillRect(0, this.margin.h, this.margin.w, this.canvasSize.h - this.margin.h * 2);
    context.fillRect(
      this.canvasSize.w - this.margin.w,
      this.margin.h,
      this.margin.w,
      this.canvasSize.h - this.margin.h * 2
    );
    context.fillRect(0, this.canvasSize.h - this.margin.h, this.canvasSize.w, this.margin.h);
  }

  private drawCenterLine(context: CanvasRenderingContext2D) {
    context.strokeStyle = 'rgba(0, 0, 255, 0.5)'; // 50% Blue.
    context.beginPath();
    context.moveTo(0, Math.ceil(this.canvasSize.h / 2));
    context.lineTo(this.canvasSize.w, Math.ceil(this.canvasSize.h / 2));
    context.moveTo(Math.ceil(this.canvasSize.w / 2), 0);
    context.lineTo(Math.ceil(this.canvasSize.w / 2), this.canvasSize.h);
    context.closePath();
    context.stroke();
  }

  private onMouseDown() {
    //const location = `${this.className}.onMouseDown()`;
    this.isMouseDragging = true;
  }

  private onMouseUp() {
    //const location = `${this.className}.onMouseUp()`;
    this.isMouseDragging = false;
  }

  private onMouseOut() {
    //const location = `${this.className}.onMouseOut()`;
    this.isMouseDragging = false;
  }

  private onMouseMove(event: MouseEvent) {
    //const location = `${this.className}.onMouseMove()`;

    if (this.isMouseDragging) {
      this.imagePos.x += event.movementX;
      this.imagePos.y += event.movementY;
      this.draw();
    }
  }

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
