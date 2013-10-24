import numpy as np
import pandas as pd
from PIL import Image
from StringIO import StringIO
import base64
import os
from sklearn.decomposition import RandomizedPCA
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import confusion_matrix
from sklearn.cross_validation import train_test_split

wd = "../numbers/"
files = [f for f in os.listdir(wd)]
files = [wd + f for f in files]

STANDARD_SIZE = (50, 50)
def get_image_data(filename):
    img = Image.open(filename)
    img = img.getdata()
    img = img.resize(STANDARD_SIZE)
    img = map(list, img)
    img = np.array(img)
    s = img.shape[0] * img.shape[1]
    img_wide = img.reshape(1, s)
    return img_wide[0]

data = []
labels = []
print "extracting features..."
for i, f in enumerate(files):
    print i, "of", len(files)
    data.append(get_image_data(f))
    labels.append(int(f.split(".")[-2][-1]))
print "done."

pca = RandomizedPCA(n_components=10)
std_scaler = StandardScaler()

X_train, X_test, y_train, y_test = train_test_split(data, labels, test_size=0.1)

print "scaling data..."
X_train = pca.fit_transform(X_train)
X_test = pca.transform(X_test)
print "done."

print "transforming data..."
X_train = std_scaler.fit_transform(X_train)
X_test = std_scaler.transform(X_test)
print "done."

print "training model..."
clf = KNeighborsClassifier(n_neighbors=33)
clf.fit(X_train, y_train)
print "done"
print "="*20
print clf

print "Confusion Matrix"
print "="*40
print confusion_matrix(y_test, clf.predict(X_test))


from yhat import BaseModel, Yhat

class DigitModel(BaseModel):

    def require(self):
        from PIL import Image
        from StringIO import StringIO
        import base64

    def transform(self, data):
        image_string = data["image_string"]
        STANDARD_SIZE = (50, 50)
        f = StringIO(base64.decodestring(image_string))
        img = Image.open(f)
        img = img.getdata()
        img = img.resize(STANDARD_SIZE)
        img = map(list, img)
        img = np.array(img)
        s = img.shape[0] * img.shape[1]
        img_wide = img.reshape(1, s)
        return img_wide[0]

    def predict(self, img):
        x = self.pca.transform([img])
        x = self.std_scaler.transform(x)
        results = {"label": self.clf.predict(x)[0]}
        probs = {"prob_" + str(i) : prob for i, prob in enumerate(self.clf.predict_proba(x)[0])}
        results['probs'] = probs
        return results

digit_model = DigitModel(clf=clf, std_scaler=std_scaler, pca=pca)

yh = Yhat("greg", "abcd1234", "http://starphleet-aa02a554-1981699582.us-west-1.elb.amazonaws.com/deployer/")
yh.deploy("digitRecognizer", digit_model) 



