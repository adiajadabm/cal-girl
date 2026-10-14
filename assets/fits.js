// Written by tools/build.py: where each fitted garment sits on the doll [centre x, top, width].
const FITS = {
  "jacket": [
    508.0,
    461,
    392
  ],
  "sweater": [
    506.5,
    454,
    349
  ],
  "cami": [
    508.0,
    511,
    222
  ],
  "dress": [
    508.5,
    453,
    269
  ],
  "jeans": [
    508.0,
    809,
    386
  ],
  "skirt": [
    506.0,
    856,
    292
  ],
  "bra": [
    507.0,
    515,
    216
  ],
  "thong": [
    508.0,
    858,
    212
  ]
};
// Outfits that exist as a full drawing on each doll; anything else falls back to the fitted pieces.
const OUTFITS = {
  "auburn": [
    "cami-jeans",
    "cami-skirt",
    "dress",
    "jacket-jeans",
    "jacket-skirt",
    "sweater-jeans",
    "sweater-skirt"
  ],
  "black": [
    "cami-jeans",
    "cami-skirt",
    "dress",
    "jacket-jeans",
    "jacket-skirt",
    "sweater-jeans",
    "sweater-skirt"
  ],
  "blonde": [
    "cami-jeans",
    "cami-skirt",
    "dress",
    "jacket-jeans",
    "jacket-skirt",
    "sweater-jeans",
    "sweater-skirt"
  ],
  "braids": [
    "cami-jeans",
    "cami-skirt",
    "dress",
    "jacket-jeans",
    "jacket-skirt",
    "sweater-jeans",
    "sweater-skirt"
  ],
  "raven": [
    "cami-jeans",
    "cami-skirt",
    "dress",
    "jacket-jeans",
    "jacket-skirt",
    "sweater-jeans",
    "sweater-skirt"
  ],
  "wavy": [
    "cami-jeans",
    "cami-skirt",
    "dress",
    "jacket-jeans",
    "jacket-skirt",
    "sweater-skirt"
  ]
};
// Looks that have a pair of walking frames (walk-<doll>-<look>-a/b.png). 'bare' is her with nothing on over the bikini.
const WALKS = {
  "auburn": [
    "bare"
  ],
  "black": [
    "bare"
  ],
  "blonde": [
    "bare"
  ]
};
// Where her legs and bag hand are in each drawing: [legs centre x, distance apart, jeans hem or null, hand x, fingertips y]. Written by tools/stance.py.
const STANCE = {
  "auburn": {
    "bare": [
      516.5,
      92.0,
      null,
      635.7,
      1146
    ],
    "cami-jeans": [
      506.0,
      135.0,
      1666,
      637.8,
      1122
    ],
    "cami-skirt": [
      522.8,
      98.5,
      null,
      637.8,
      1122
    ],
    "dress": [
      521.0,
      82.0,
      null,
      643.6,
      1130
    ],
    "jacket-jeans": [
      502.5,
      135.0,
      1654,
      679.7,
      1081
    ],
    "jacket-skirt": [
      502.0,
      111.0,
      null,
      679.7,
      1081
    ],
    "sweater-jeans": [
      507.5,
      133.0,
      1592,
      665.2,
      1096
    ],
    "sweater-skirt": [
      517.2,
      90.5,
      null,
      665.2,
      1096
    ]
  },
  "black": {
    "bare": [
      518.0,
      94.0,
      null,
      638.6,
      1146
    ],
    "cami-jeans": [
      509.5,
      76.5,
      1569,
      675.3,
      1090
    ],
    "cami-skirt": [
      523.8,
      96.5,
      null,
      632.5,
      1195
    ],
    "dress": [
      502.0,
      76.0,
      null,
      651.0,
      1112
    ],
    "jacket-jeans": [
      500.5,
      135.0,
      1647,
      670.1,
      1082
    ],
    "jacket-skirt": [
      502.2,
      94.5,
      null,
      654.7,
      1103
    ],
    "sweater-jeans": [
      498.5,
      134.0,
      1589,
      658.5,
      1077
    ],
    "sweater-skirt": [
      496.0,
      98.0,
      null,
      670.6,
      1079
    ]
  },
  "blonde": {
    "bare": [
      516.5,
      92.0,
      null,
      642.2,
      1150
    ],
    "cami-jeans": [
      506.2,
      135.0,
      1666,
      671.8,
      1096
    ],
    "cami-skirt": [
      519.8,
      94.5,
      null,
      630.9,
      1189
    ],
    "dress": [
      502.5,
      70.0,
      null,
      649.7,
      1115
    ],
    "jacket-jeans": [
      500.5,
      135.0,
      1654,
      685.7,
      1065
    ],
    "jacket-skirt": [
      501.5,
      106.0,
      null,
      659.2,
      1154
    ],
    "sweater-jeans": [
      508.5,
      122.0,
      1591,
      677.4,
      1082
    ],
    "sweater-skirt": [
      517.2,
      92.5,
      null,
      645.0,
      1152
    ]
  },
  "braids": {
    "bare": [
      518.2,
      93.5,
      null,
      648.0,
      1116
    ],
    "cami-jeans": [
      593.2,
      135.0,
      1640,
      704.3,
      1050
    ],
    "cami-skirt": [
      518.0,
      85.0,
      null,
      678.9,
      1059
    ],
    "dress": [
      525.0,
      81.0,
      null,
      653.8,
      1063
    ],
    "jacket-jeans": [
      506.8,
      134.5,
      1667,
      685.9,
      1072
    ],
    "jacket-skirt": [
      508.8,
      92.5,
      null,
      684.1,
      1074
    ],
    "sweater-jeans": [
      531.5,
      87.5,
      1605,
      665.9,
      1071
    ],
    "sweater-skirt": [
      507.0,
      96.0,
      null,
      664.7,
      1089
    ]
  },
  "raven": {
    "bare": [
      506.0,
      80.0,
      null,
      649.1,
      1119
    ],
    "cami-jeans": [
      493.5,
      81.5,
      1605,
      660.7,
      1072
    ],
    "cami-skirt": [
      515.5,
      75.0,
      null,
      654.0,
      1098
    ],
    "dress": [
      498.0,
      71.0,
      null,
      651.2,
      1073
    ],
    "jacket-jeans": [
      502.0,
      135.0,
      1666,
      678.8,
      1070
    ],
    "jacket-skirt": [
      509.2,
      75.5,
      null,
      629.6,
      1106
    ],
    "sweater-jeans": [
      488.5,
      85.5,
      1611,
      654.2,
      1069
    ],
    "sweater-skirt": [
      507.5,
      81.0,
      null,
      656.6,
      1067
    ]
  },
  "wavy": {
    "bare": [
      512.5,
      89.0,
      null,
      644.2,
      1123
    ],
    "cami-jeans": [
      536.0,
      115.0,
      1659,
      684.6,
      1024
    ],
    "cami-skirt": [
      516.2,
      81.5,
      null,
      677.1,
      1062
    ],
    "dress": [
      509.2,
      82.5,
      null,
      645.9,
      1074
    ],
    "jacket-jeans": [
      507.2,
      135.0,
      1667,
      686.2,
      1078
    ],
    "jacket-skirt": [
      515.2,
      101.5,
      null,
      624.6,
      1161
    ],
    "sweater-skirt": [
      506.5,
      92.0,
      null,
      663.8,
      1088
    ]
  }
};
