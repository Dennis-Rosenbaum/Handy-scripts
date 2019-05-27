$.widget("ui.autocomplete", $.ui.autocomplete, {
    options: $.extend({}, this.options, {
        multiselect: false,
        minLength: 0
    }),
    value: function (value) {
        var localName = this.element[0].localName;
        if (localName === "select") {
            var id = $(this.element).attr("id");
            var value = $(`#${id}_Autocomplete`).autocomplete("value");
            return value;
        }

        return $.map($(this.element).parent().find(".ui-autocomplete-multiselect-item"), function (n) { return $(n).data("id"); });
    },
    _create: function () {
        var localName = this.element[0].localName;

        if (localName === "select") {
            return this._createForSelect();
        }

        this._super();

        var self = this;
        var o = self.options;

        if (o.multiselect) {
            self.selectedItems = {};
            self.multiselect = $("<div></div>")
                .addClass("ui-autocomplete-multiselect ui-state-default ui-widget")
                .insertBefore(self.element)
                .append(self.element)
                .bind("click.autocomplete", function () {
                    self.element.focus();
                });

            var kc = $.ui.keyCode;
            self.element.bind({
                "keydown.autocomplete": function (e) {
                    if ((this.value === "") && (e.keyCode == kc.BACKSPACE)) {
                        var prev = self.element.prev();
                        delete self.selectedItems[prev.text()];
                        prev.remove();
                    }
                }
            }).trigger("change");

            //show autocomplete on focus
            self.element.bind({
                "focus": function (e) {
                    if (this.value === "") {
                        $(self.element).keydown();
                    }
                }
            });

            o.select = o.select || function (e, ui) {
                $("<div></div>")
                    .addClass("ui-autocomplete-multiselect-item")
                    .attr("data-id", ui.item.value)
                    .text(ui.item.label)
                    .prepend(
                        $("<span></span>")
                            .addClass("ui-icon ui-icon-close")
                            .click(function () {
                                var item = $(this).parent();
                                delete self.selectedItems[item.text()];
                                item.remove();
                            })
                    )
                    .insertBefore(self.element);

                self.selectedItems[ui.item.label] = ui.item;
                self._value("");
                return false;
            }
        }

        return this;
    },
    _createForSelect: function () {
        var select  = $(this.element);
        var options = $(select).find("option");
        var newId   = $(select).attr("id") + "_Autocomplete";
        var source  = $.map(options, function (o) {
            return { value: $(o).val(), label: $(o).text() };
        });

        ////hide the dropdown
        $(select).addClass("ui-autocomplete");
        $(select).hide();

        ////add the new input field
        var input = $("<input>").attr("type", "text").attr("id", newId);
        $(select).after(input);

        return $(input).autocomplete({
            source: source,
            multiselect: true,
        });
    }
});