import { updateMap } from "../components/map";
import { renderVega } from "./mapd-connector";
import { conv4326To900913 } from "./map-utils";

export const createVegaSpec = ({width, height, xMin, xMax, yMin, yMax, dateString}) => {
  console.log("vega-spec:updateVage:mapBounds:[w,y] [xMin, xMax, yMin, yMax]", 
    [width, height], [xMin, xMax, yMin, yMax]);
  // TODO: plugin date param in query (per day or hr???)
  const vegaSpec = {
    width: width,
    height: height,
    data: [
      {
        name: "pointmapLayer0",
        sql: `SELECT conv_4326_900913_x(ST_X(omnisci_geo)) as x, 
          conv_4326_900913_y(ST_Y(omnisci_geo)) as y, 
          DAMAGE as color, ca_camp_fire_structure_damage_assessment.rowid 
        FROM ca_camp_fire_structure_damage_assessment 
        WHERE ((ST_X(omnisci_geo) >= ${xMin} AND ST_X(omnisci_geo) <= ${xMax}) 
          AND (ST_Y(omnisci_geo) >= ${yMin} AND ST_Y(omnisci_geo) <= ${yMax}))
        LIMIT 2000000`
      },
      {
        name: "backendChoroplethLayer1",
        format: "polys",
        geocolumn: "omnisci_geo",
        sql: `SELECT ca_butte_county_parcels.rowid as rowid 
        FROM ca_butte_county_parcels 
        WHERE (ca_butte_county_parcels.LandUse ILIKE '%RS%')`
      }
    ],
    scales: [
      {
        name: "x",
        type: "linear",
        domain: [-13555964.625327317, -13525018.495338732],
        range: "width"
      },
      {
        name: "y",
        type: "linear",
        domain: [4802130.144704299, 4842172.415544986],
        range: "height"
      },
      {
        name: "pointmapLayer0_fillColor",
        type: "ordinal",
        domain: [
          "Destroyed (>50%)",
          "Affected (1-9%)",
          "Minor (10-25%)",
          "Major (26-50%)",
          "Other"
        ],
        range: [
          "rgba(234,85,69,1)",
          "rgba(189,207,50,1)",
          "rgba(179,61,198,1)",
          "rgba(239,155,32,1)",
          "rgba(39,174,239,1)"
        ],
        default: "rgba(39,174,239,1)",
        nullValue: "rgba(202,202,202,1)"
      }
    ],
    projections: [
      {
        name: "mercator_map_projection",
        type: "mercator",
        bounds: {
          x: [-121.77530215585907, -121.49730834028996],
          y: [39.5594664692064, 39.836231966725734]
        }
      }
    ],
    marks: [
      {
        type: "symbol",
        from: { data: "pointmapLayer0" },
        properties: {
          xc: { scale: "x", field: "x" },
          yc: { scale: "y", field: "y" },
          fillColor: { scale: "pointmapLayer0_fillColor", field: "color" },
          shape: "circle",
          width: 6,
          height: 6
        }
      },
      {
        type: "polys",
        from: { data: "backendChoroplethLayer1" },
        properties: {
          x: { field: "x" },
          y: { field: "y" },
          fillColor: { value: "rgba(39,174,239,0.2)" },
          strokeColor: "white",
          strokeWidth: 1,
          lineJoin: "miter",
          miterLimit: 10
        },
        transform: { projection: "mercator_map_projection" }
      }
    ]
  };
  return vegaSpec;
};

export function updateVega(map, dateString = "2018-11-08 00:00:00") {
  const container = map.getContainer();
  const height = container.clientHeight;
  const width = container.clientWidth;

  const {_sw, _ne} = map.getBounds();
  const [xMin, yMin] = conv4326To900913([_sw.lng, _sw.lat]);
  const [xMax, yMax] = conv4326To900913([_ne.lng, _ne.lat]);

  const vegaSpec = createVegaSpec({width, height, xMin, xMax, yMin, yMax, dateString});

  console.log("vega-spec:updateVage:mapBounds:[w,y] [xMin, xMax, yMin, yMax]", 
    [width, height], [xMin, xMax, yMin, yMax]);

  // render the vega and add it to the map
  renderVega(vegaSpec)
    .then(result => {
      updateMap(result);
    })
    .catch(error => {
      throw error;
    });
}
