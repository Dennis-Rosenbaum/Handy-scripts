$(function () {
    $("*[data-special-type=\"click-edit-focusout-save\"]").clickEditFocusoutSaveField();
});

(function ($) {
    $.fn.clickEditFocusoutSaveField = function (options) {
        return this.each(function () {
            var settings = $.extend({}, $.fn.clickEditFocusoutSaveField.defaults, options);
            var states = $.extend({}, $.fn.clickEditFocusoutSaveField.fieldStates);

            var field = $(this);
            var text = field.text();

            if (field.data("click-edit-focusout-save-initialized")) {
                return;
            }

            if (!getPostUrl()) {
                console.error("No post url added to an edit and save field. The field expects an 'data-click-edit-focusout-save-url' attribute with the url to post the changed field.");
            }

            initializeField();
            setStatusToView();

            field.on("click", onClicked);
            field.on("focusout", onFocusout);
            field.hover(onHoverIn, onHoverOut);

            field.data("click-edit-focusout-save-initialized", true);


            function initializeField() {
                var statusField = `<div class="click-edit-focusout-save-status-field" style="display:inline-block; padding-right: 10px;">` +
                    `<img style="display:none; height:15px;" class="click-edit-focusout-save-saving-loader" src="${settings.loadingUrl}"/>` +
                    `<span style="display:none;" class="click-edit-focusout-save-failed ${settings.failedClass}"></span>` +
                    `<span style="display:none;" class="click-edit-focusout-save-success ${settings.successClass}"></span>` +
                    `</div>`;

                field.prepend(statusField);
                field.append(`<span style="display:none; margin-left:10px;" class="click-edit-focusout-save-edit-button ${settings.editButtonClass}"></span>`);
                field.css("padding", "3px 6px");
                field.css("border", "1px solid transparent");
            }

            function getPostUrl() { return field.data("click-edit-focusout-save-url"); }

            function getStatus() { return field.data("click-edit-focusout-save-status"); }
            function setStatus(state) { field.data("click-edit-focusout-save-status", state); }
            function getStatus() { return field.data("click-edit-focusout-save-status"); }
            function getIconFailed() { return field.find(".click-edit-focusout-save-failed"); }
            function getSavingLoader() { return field.find(".click-edit-focusout-save-saving-loader"); }
            function getIconWorked() { return field.find(".click-edit-focusout-save-success"); }
            function getIconEdit() { return field.find(".click-edit-focusout-save-edit-button"); }

            function setStatusToView() {
                getIconEdit().show();
                field.removeAttr("contenteditable");
                field.css("border-color", "transparent");
                setStatus(states.view);
            }

            function setStatusToEdit() {
                getIconEdit().hide();
                getSavingLoader().hide();
                getIconWorked().hide();
                getIconFailed().hide();
                field.css("border-color", "#CCC");
                field.attr("contenteditable", true);
                field.focus();
                setStatus(states.edit);
            }

            function setStatusToSaving() {
                getSavingLoader().show();
                setStatus(states.saving);

                var textToSave = field.text();
                var data = { data: textToSave };
                $.ajax({
                    type: 'POST',
                    data: JSON.stringify(data),
                    url: getPostUrl(),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).done(function (json) {
                    setSavingWorked();
                    text = textToSave;
                }).fail(function (xhr, textStatus, errorThrown) {
                    setSavingFailed(errorThrown.message);
                });

                field.removeAttr("contenteditable");
            }

            function setSavingWorked() {
                getSavingLoader().hide();
                getIconWorked().show();
                setStatusToView();
            }

            function setSavingFailed(message) {
                getSavingLoader().hide();
                getIconFailed().show();
                getIconFailed().attr("title", message);
                setStatusToView();
            }

            function onClicked() {
                if (getStatus() != states.view) return;

                setStatusToEdit();
            }

            function onFocusout() {
                if (getStatus() != states.edit) return;

                if (text === field.text()) {
                    console.log(`Not saving the text as it is the same. Old text: ${text}, new text: ${field.text()}`);
                    setStatusToView();
                    return;
                }

                setStatusToSaving();
            }

            function onHoverIn() { if (getStatus() === "view") { field.css("border-color", "#EEE"); } }
            function onHoverOut() { if (getStatus() === "view") { field.css("border-color", "transparent"); } }
        });
    };

    $.fn.clickEditFocusoutSaveField.fieldStates = {
        view: "view",
        edit: "edit",
        saving: "saving"
    }

    $.fn.clickEditFocusoutSaveField.defaults = {
        loadingUrl: 'loader.gif',
        failedClass: 'icon icon-failed w16 hover',
        successClass: 'icon icon-success w16 hover',
        editButtonClass: 'icon icon-edit w16 hover'
    }

})(jQuery);