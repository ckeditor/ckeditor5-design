'use strict';

import CKEDITOR from './ckeditor';

import Bold from './ckeditor5-basicstyles/bold';
import Italic from './ckeditor5-basicstyles/italic';
import ClassicCreator from './ckeditor5-classiccreator/classiccreator';
import ImageCaption from './ckeditor5-image/imagecaption';
import Button from './ckeditor5-button/button';

CKEDITOR.features = [ Bold, Italic, ClassicCreator, ImageCaption, Button ];

export default CKEDITOR;