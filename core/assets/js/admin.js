(function ($) {

	"use strict";

	const HelpfulAdmin = {
		loader: "<div class=\"helpful_loader\"><i class=\"dashicons dashicons-update\"></i></div>",
		canvas: "<canvas class=\"chart\"></canvas>",
		init: function () {
			var self = this;

			$(".helpful-admin-panel").each(function () {
				var currentTab = $(this);
				self.togglePanel(currentTab);
			});

			$("select.linked").on("change", function (e) {
				e.preventDefault();
				window.location.href = $(this).find("option:selected").val();
			});

			if ($(".helpful-date").length > 0) {
				self.datePicker();
			}

			if ($(".helpful-range-form").length > 0) {
				self.getStatsRange();
				$(".helpful-range-form").on("change", function () {
					self.getStatsRange();
				});
			}

			if ($(".helpful-total").length > 0) {
				self.getStatsTotal();
			}

			if ($("#helpful-table-posts").length > 0) {
				self.datatablePosts();
			}
		},
		togglePanel: function (tabElement) {
			var currentButton = $(tabElement).find("button")[0];
			$(currentButton).on("click", function (e) {
				e.preventDefault();
				$(tabElement).toggleClass("active");
			});
		},
		datePicker: function () {
			$(".helpful-date").datepicker({
				changeMonth: true,
				changeYear: true,
				dateFormat: "yy-mm-dd",
			});
		},
		getStatsRange: function () {
			const self = this;
			var canvas;
			var el = $(".helpful-range");
			var form = $(".helpful-range-form");
			var data = $(form).serializeArray();

			$(el).html(self.loader);

			self.ajaxRequest(data).done(function (response) {
				if (!("status" in response)) {
					$(el).html(self.canvas);
					canvas = $(el).find(".chart")[0].getContext("2d");

					// show percentages on doughnuts
					// since 4.0.1
					if ('doughnut' === response.type) {
						response.options.tooltips = {
							callbacks: {
								label: function (tooltipItem, data) {
									var dataset = data.datasets[tooltipItem.datasetIndex];
									var meta = dataset._meta[Object.keys(dataset._meta)[0]];
									var total = meta.total;
									var currentValue = dataset.data[tooltipItem.index];
									var percentage = parseFloat((currentValue / total * 100).toFixed(1));
									percentage = (isNaN(percentage)) ? 0 : percentage;
									return currentValue + ' (' + percentage + '%)';
								},
								title: function (tooltipItem, data) {
									return data.labels[tooltipItem[0].index];
								},
							},
						};
					}
					// show percentages on bars
					else {
						response.options.tooltips = {
							callbacks: {
								label: function (tooltipItem, data) {
									var total = 0;
									var pro = data.datasets[0].data[tooltipItem.index];
									var contra = data.datasets[1].data[tooltipItem.index];
									var total = pro + contra;
									var dataset = data.datasets[tooltipItem.datasetIndex];
									var currentValue = dataset.data[tooltipItem.index];
									var percentage = parseFloat((currentValue / total * 100).toFixed(1));
									percentage = (isNaN(percentage)) ? 0 : percentage;
									return currentValue + ' (' + percentage + '%)';
								},
								title: function (tooltipItem, data) {
									return data.labels[tooltipItem[0].index];
								},
							}
						}
					}

					new Chart(canvas, response);
				} else {
					$(el).html(response.message);
				}
			});

			return;
		},
		getStatsTotal: function () {
			const self = this;
			var canvas;
			var el = $(".helpful-total");
			var data = { "action": "helpful_total_stats", "_wpnonce": helpful_admin.nonce };

			$(el).html(self.loader);

			self.ajaxRequest(data).done(function (response) {
				if (!("status" in response)) {
					$(el).html(self.canvas);
					canvas = $(el).find(".chart")[0].getContext("2d");
					new Chart(canvas, response);
				} else {
					$(el).html(response.message);
				}
			});

			return;
		},
		datatablePosts: function () {
			var container = $('#helpful-table-posts');
			var options = this.tableOptions();

			$.extend(options, {
				"ajax": {
					"url": helpful_admin.ajax_url,
					"data": function (d) {
						d._wpnonce = helpful_admin.nonce;
						d.action = "helpful_get_posts_data";
					},
				},
				"language": helpful_admin.language,
				"columns": [
					{
						"data": {
							"display": "post_id",
							"sort": "post_id",
							"filter": "post_id",
						},
						"visible": false,
						"type": "num",
					},
					{
						"data": {
							"display": "post_title",
							"sort": "post_title",
							"filter": "post_title",
						},
						"visible": true,
						"type": "html",
					},
					{
						"data": {
							"display": "post_type.display",
							"sort": "post_type.sort",
							"filter": "post_type.display",
						},
						"visible": false,
						"type": "html",
					},
					{
						"data": {
							"display": "post_author.display",
							"sort": "post_author.sort",
							"filter": "post_author.display",
						},
						"visible": false,
						"type": "html",

					},
					{
						"data": {
							"display": "pro.display",
							"sort": "pro.sort",
							"filter": "pro.display",
						},
						"visible": true,
						"type": "num",
					},
					{
						"data": {
							"display": "contra.display",
							"sort": "contra.sort",
							"filter": "contra.display",
						},
						"visible": true,
						"type": "num",
					},
					{
						"data": {
							"display": "helpful.display",
							"sort": "helpful.sort",
							"filter": "helpful.display",
						},
						"visible": true,
						"type": "num",
					},
					{
						"data": {
							"display": "feedback.display",
							"sort": "feedback.sort",
							"filter": "feedback.display",
						},
						"visible": true,
						"type": "html",
					},
					{
						"data": {
							"display": "post_date.display",
							"sort": "post_date.sort",
							"filter": "post_date.display",
						},
						"visible": true,
						"type": "num",
					}
				],
			});

			var table = $(container).DataTable(options);

			table.column('0:visible').order('desc').draw();

			table.on( 'buttons-action', function () {
				table.ajax.reload()
			} );
		},
		tableOptions: function () {
			return {
				"dom": '<"fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix ui-corner-tl ui-corner-tr"Blfr>'+
				"t" +
				'<"fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix ui-corner-bl ui-corner-br"ip>',
				"buttons": [ "colvis" ],
				"scrollY": 275,
				"deferRender": true,
				"scroller": true,
				"responsive": true,
				"processing": false,
				"serverSide": false,
			};
		},
		ajaxRequest: function (data, method = "POST") {
			return $.ajax({
				url: helpful_admin.ajax_url,
				data: data,
				method: method,
			});
		},
	};

	$(function () {
		HelpfulAdmin.init();
	});

})(jQuery);