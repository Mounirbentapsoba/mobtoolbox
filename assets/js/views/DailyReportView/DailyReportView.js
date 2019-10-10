import {
    MobService
} from '/assets/js/services/MobService/MobService.js';

export const DailyReportView = Backbone.View.extend({
    el: '#main',
    data: {},
    template: 'views/DailyReportView/DailyReportView.html',
    templateCache: null,

    initData() {
        this.data = JSON.parse(localStorage.getItem('daily-reports'));
        if (!this.data || !Object.keys(this.data).length) {
            this.data = {};
        }
    },

    saveData() {
        localStorage.setItem('daily-reports', JSON.stringify(this.data));
    },

    render() {
        if (this.templateCache) {
            this.doRender();
            return this;
        }

        MobService.getTemplate(this.template).then((html) => {
            this.templateCache = _.template(html);
            this.doRender();
        });
        return this;
    },

    doRender() {
        $(this.el).html(this.templateCache);
        this.initData();
        this.renderAddQuestionsInput();
        this.renderQAInput();
    },

    renderAddQuestionsInput() {
        const $addQuestionInput = $('#add-question-input');
        $addQuestionInput.keyup((e) => {
            var code = e.which;
            if (code == 13) {
                e.preventDefault();
                if (!this.data.questions) {
                    this.data.questions = [];
                }
                this.data.questions.push($addQuestionInput.val());
                $addQuestionInput.val('');
                this.saveData();
                this.renderQAInput();
            }
        });
    },

    renderQAInput() {
        const $qaForm = $('#q-and-a-form', this.$el);
        $qaForm.empty();
        this.data.questions.forEach((question, i) => {
            const label = `<label for="answer-to-question-${i}">${question}</label>`;
            const input = `<input class="form-control" id="answer-to-question-${i}"">`;
            $qaForm.append(label);
            $qaForm.append(input);
        });
    },

});