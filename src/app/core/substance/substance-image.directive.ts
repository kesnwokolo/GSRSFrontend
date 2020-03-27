import { Directive, ElementRef, Input, AfterViewInit } from '@angular/core';
import { UtilsService } from '../utils/utils.service';

@Directive({
  selector: '[appSubstanceImage]'
})
export class SubstanceImageDirective implements AfterViewInit {
  private privateEntityId: string;
  private privateSize?: number;
  private privateStereo = false;
  private imageElement: HTMLImageElement;
  private isAfterViewInit = false;
  private privateAtomMaps?: Array<number>;

  constructor(
    private el: ElementRef,
    private utilsService: UtilsService
  ) {
    this.imageElement = this.el.nativeElement as HTMLImageElement;
  }

  ngAfterViewInit() {
    this.isAfterViewInit = true;
    this.setImageSrc();
  }

  @Input()
  set entityId(entityId: string) {
    if (entityId !== this.privateEntityId) {
      this.privateEntityId = entityId;
      this.setImageSrc();
    }
  }

  @Input()
  set size(size: number) {
    if (size !== this.privateSize) {
      this.privateSize = size;
      this.setImageSrc();
    }
  }

  @Input()
  set stereo(showStereo: boolean) {
    if (showStereo !== this.privateStereo) {
      this.privateStereo = showStereo;
      this.setImageSrc();
    }
  }

  @Input()
  set atomMaps(atomMaps: Array<number>) {
    if (atomMaps !== this.privateAtomMaps) {
      this.privateAtomMaps = atomMaps;
      this.setImageSrc();
    }
  }

  private setImageSrc(): void {
    if (this.isAfterViewInit) {
      const srcUrl = this.utilsService.getStructureImgUrl(this.privateEntityId, this.privateSize, this.privateStereo, this.privateAtomMaps);
      this.imageElement.src = srcUrl;
    }
  }
}
