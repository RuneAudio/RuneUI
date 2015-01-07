window.helpers = window.helpers || {};
window.data = window.data || {};

// base data loading function
data.getData = function (vm) {
    var url = vm.url;
    if (vm.id) {
        url += '/' + vm.id;
    }
    toggleLoader('open');
    var loaderClose = function () {
        helpers.toggleLoader('close');
    };
    var loaderCloseFail = function () {
        console.log('FAIL');
    };
    return m.request({ method: 'GET', url: url }).then(function (response) {
        vm.data = response;
        vm.originalData = JSON.parse(JSON.stringify(response)); // we need a clone of this object
    }).then(loaderClose, loaderCloseFail);
};

// base data saving function
data.postData = function (url, data) {
    console.log(url);
    console.log(data);
    toggleLoader('open');
    var loaderClose = function () {
        helpers.toggleLoader('close');
    };
    var loaderCloseFail = function () {
        console.log('FAIL');
    };
    m.request({
        method: 'POST',
        url: url,
        data: data,
        unwrapSuccess: function (response) {
            return;
        },
        unwrapError: function (response) {
            return "oops";
        },
        // PHP errors are not wrapped in Proper JSON,. breaking Mitrhil
        deserialize: function (value) { return value; }
    }).then(loaderClose, loaderCloseFail);
};