/***********************************************************************
 * Some constants
 **********************************************************************/
var GRAS_CHARTS_STD_WIDTH = 250;

/***********************************************************************
 * Stats registry data structure
 **********************************************************************/
var GrasStatsRegistry = function()
{
    this.init = false;
    this.overall_rate = 2.0;
    this.overall_active = true;
    this.block_ids = new Array();
    this.top_id = 'top';
    this.online = true;
    this.offline_count = 0;
}

/***********************************************************************
 * Query stats
 **********************************************************************/
var gras_query_stats = function(registry)
{
    $.ajax({
        type: "GET",
        async: true,
        url: "/stats.json",
        dataType: "json",
        success: function(response)
        {
            registry.online = true;
            gras_chart_factory_online(registry);
            if (registry.overall_active)
            {
                if (!registry.init)
                {
                    gras_chart_factory_setup(registry, response);
                    try{gras_chart_load(registry);}catch(e){}
                    registry.init = true;
                }
                $.each(registry.active_charts, function(index, chart_info)
                {
                    chart_info.chart.update(response);
                });

                registry.timeout_handle = window.setTimeout(function()
                {
                    gras_query_stats(registry);
                }, Math.round(1000/registry.overall_rate));
            }
        },
        error: function()
        {
            registry.online = false;
            gras_chart_factory_online(registry);
            registry.timeout_handle = window.setTimeout(function()
            {
                gras_query_stats(registry);
            }, 1000);
        },
    });
}

/***********************************************************************
 * Init
 **********************************************************************/
var gras_stats_main = function()
{
    var registry = new GrasStatsRegistry();
    gras_chart_factory_init(registry);
    gras_query_stats(registry);
}