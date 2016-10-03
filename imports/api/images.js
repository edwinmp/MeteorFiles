/**
 * Created by edwinm on 14/09/2016.
 */
import { FilesCollection } from 'meteor/ostrio:files';

const Images = new FilesCollection({
    /**
     * [storagePath Use full path, preferably the data folder]
     * @type {String}
     */
    storagePath: '/Users/macbook2016/Workspaces/Meteor/MeteorFiles/imports/data/images/profile',
    collectionName: 'Images',
    allowClientCode: false, // Disallow remove files from Client
    onBeforeUpload: function (file) {
        // Allow upload files under 10MB, and only in png/jpg/jpeg formats
        if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.extension)) {
            return true;
        } else {
            return 'Please upload image, with size equal or less than 10MB';
        }
    }
});

if (Meteor.isClient) {
    Meteor.subscribe('files.images.all');
}

if (Meteor.isServer) {
    Meteor.publish('files.images.all', function () {
        return Images.find().cursor;
    });
}

export { Images as default };
