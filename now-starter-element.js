var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NowElements;
(function (NowElements) {
    var NowStarterElement = (function (_super) {
        __extends(NowStarterElement, _super);
        function NowStarterElement() {
            _super.apply(this, arguments);
        }
        __decorate([
            property({ type: String })
        ], NowStarterElement.prototype, "prop1", void 0);
        NowStarterElement = __decorate([
            component('now-starter-element')
        ], NowStarterElement);
        return NowStarterElement;
    }(NowElements.BaseElement));
    NowElements.NowStarterElement = NowStarterElement;
})(NowElements || (NowElements = {}));
NowElements.NowStarterElement.register();

//# sourceMappingURL=now-starter-element.js.map
