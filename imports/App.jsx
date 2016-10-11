import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
// import 'cropperjs';
import '../node_modules/cropper/dist/cropper.css'
import ReactCropper from './Cropper';

import Images from '../imports/api/images';

/* Add custom CSS to the client/main.css file or somewhere they can be imported */

// App component - represents the whole app
class App extends Component {
    constructor() {
        super();

        this.state = {
            fileID: null,
            fileName: null,
            progress: 0,
            uploading: false,
            imageUrl: '',
            cropper: null,
        };

        this.onChange = this.onChange.bind(this);
        this.getImages = this.getImages.bind(this);
        this.onClick = this.onClick.bind(this);
        this.uploadCroppedImage = this.uploadCroppedImage.bind(this);
    }
    render() {
        return (
            this.getContent()
        );
    }
    // componentDidMount() { // TODO: Delete after preferred carousel settings are configured
    //     // Use listener to make sure the dom to be fully loaded. Otherwise cropper won't work
    //     window.addEventListener('DOMContentLoaded', this.createCropper);
    // }
    // componentDidUpdate() {
    //     const node = ReactDOM.findDOMNode(this.file);
    //     if(node) {
    //         // Use timeout delay to allow the dom to be fully loaded. Otherwise cropper won't work
    //         Meteor.setTimeout(()=> {
    //             // window.cropper = new Cropper(node, {
    //             //     aspectRatio: 1,
    //             //     zoomable: false,
    //             // });
    //             this.createCropper();
    //         }, 50);
    //     }
    // }
    getContent() {
        const cursor = Images.findOne({ _id: this.state.fileID });
        this.fileExtension = cursor ? cursor.extension : null;
        const filePath = cursor ? cursor.link() : '';
        // const filePath = "http://localhost:3000/cdn/storage/Images/Zrotg45Bf3XftoWX7/original/Zrotg45Bf3XftoWX7.jpg";
        if (this.state.uploading) {
            return (
                <div className="container">
                    Uploading <b>{this.state.fileName}</b>:
                    <span id="progress">{this.state.progress}%</span>
                </div>
            );
        }
        return (
            <div>
                <input id="fileInput" type="file" onChange={this.onChange} />
                <div className="img-container">
                    <ReactCropper
                        ref={(c) => this.cropper = c }
                        src={filePath}
                        aspectRatio={1}
                    />
                </div>
                <div>
                    <button className="btn btn-primary" onClick={this.onClick}>Crop</button>
                </div>
                <div>
                  {this.getImages()}
                </div>
                <CropperContainer />
            </div>
        );
    }
    getImages() {
        let key = 0;
        return Images.find({}).map((image) => {
          key++;
          const cursor = Images.findOne({ _id: image._id });
          return <img id={image._id} key={key} src={cursor.link()} />
        });
    }
    onChange(event) {
        if (event.currentTarget.files && event.currentTarget.files[0]) {
            // We upload only one file, in case
            // multiple files were selected
            const upload = Images.insert({
                file: event.currentTarget.files[0],
                streams: 'dynamic',
                chunkSize: 'dynamic'
            }, false);

            upload.on('start', function () {
                this.setState({ uploading: true });
            }.bind(this));

            upload.on('end', function (error, fileObj) {
                if (error) {
                    alert('Error during upload: ' + error);
                }
                this.setState({ uploading: false, fileName: fileObj.name, fileID: fileObj._id });
            }.bind(this));

            upload.start();
        }
    }
    onClick() {
        // this.base64 = cropper.getCroppedCanvas().toDataURL('image/' + this.fileExtension);
        if (this.cropper) {
            this.cropper.getCroppedCanvas().toBlob(this.uploadCroppedImage);
        } else {
            console.log("Node missing!");
        }

    }
    // createCropper() {
    //     const node = ReactDOM.findDOMNode(this.file);
    //     window.cropper = new Cropper(node, {
    //         aspectRatio: 1,
    //         zoomable: false,
    //     });
    //     // this.setState({ cropper });
    // }
    uploadCroppedImage(blob) {
        console.log(blob);
        let formData = new FormData();
        formData.append('croppedImage', blob);
        const upload = Images.insert({
            file: new File([blob], this.state.fileName),
            streams: 'dynamic',
            chunkSize: 'dynamic'
        }, false);

        upload.on('start', function () {
            this.setState({ uploading: true });
        }.bind(this));

        upload.on('end', function (error, fileObj) {
            if (error) {
                alert('Error during upload: ' + error);
            }
            this.setState({ uploading: false, fileName: fileObj.name, fileID: fileObj._id });
        }.bind(this));

        upload.start();
    }
}

App.propTypes = {
    images: PropTypes.array.isRequired,
};

App.fileExtension = null;
App.base64 = null;
App.cropper = null;

const CropperContainer = (props) => (
    <div className={"cropper-container cropper-bg"}>
    </div>
);

export default createContainer(() => {
    return {
        images: Images.find({}).fetch(),
    };
}, App);
