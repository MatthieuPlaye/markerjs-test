import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import {
  IonicModule,
  ModalController,
  RefresherCustomEvent,
} from '@ionic/angular';
import { PhotoService } from '../services/photo.service';
import * as markerjs2 from 'markerjs2';
import { IonModal } from '@ionic/angular';

interface LocalFile {
  name: string;
  data: string;
  path: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HomePage {
  private photoService = inject(PhotoService);
  private modalController = inject(ModalController);

  public images: LocalFile[] = [];
  public markerArea: markerjs2.MarkerArea;
  public selectedImage: LocalFile;
  public modalCanClose = false;

  @ViewChild('target') public target: ElementRef;
  @ViewChild('img') public img: ElementRef;
  @ViewChild(IonModal) modal: IonModal;

  public async takePicture() {
    const image = await this.photoService.getPhotoByCamera(); // Returns Photo object

    if (image) {
      this.images.push({
        name: new Date().getTime() + '.jpeg',
        path: 'images',
        data: `data:image/jpeg;base64,${image.base64String}`,
      });
    }
  }

  public setSelectedImage(image: LocalFile) {
    this.selectedImage = image;
    this.modal.present();
  }

  public initMarkerJs() {
    this.markerArea = new markerjs2.MarkerArea(this.img.nativeElement);
    this.markerArea.targetRoot = this.target.nativeElement;
    this.markerArea.renderAtNaturalSize = true;
    this.markerArea.availableMarkerTypes = [
      markerjs2.FreehandMarker,
      markerjs2.ArrowMarker,
      markerjs2.MeasurementMarker,
      markerjs2.LineMarker,
      'FrameMarker',
      markerjs2.EllipseMarker,
    ];

    this.markerArea.addEventListener('render', (event) => {
      // Update image in array
      const index = this.images.findIndex(
        (image) => image.name === this.selectedImage.name
      );
      this.images[index].data = event.dataUrl;
    });

    this.markerArea.addEventListener('close', () => {
      this.selectedImage = null;
      this.modalCanClose = true;
      // Close modal
      this.modal.dismiss();
    });

    // finally, call the show() method and marker.js UI opens
    this.markerArea.show();
    this.modalCanClose = false;
  }
}
