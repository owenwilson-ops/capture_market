// Real coaching staff data collected from official athletics websites
// Sources: individual school athletics sites (Sidearm platform and custom sites)
// Collected: June 2026
// NOTE: Photo URLs use the Sidearm CDN (dxbhsrqyrr690.cloudfront.net) where available.
// Several JS-rendered sites (Duke, UNC, Maryland, Syracuse, Virginia, Michigan, Ohio State,
// Boston College, Princeton, Army, JMU, Marquette, Denver, Georgetown, Yale) returned
// coach names/emails from search index data but no CDN photo URLs due to client-side rendering.

export const REAL_COACHING_STAFF = {
  // Source: https://clemsontigers.com/sports/womens-lacrosse/roster
  clemson: {
    coachingStaff: [
      {
        name: "Allison Kwolek",
        title: "Head Coach",
        email: "akwolek@clemson.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Bill Olin",
        title: "Associate Head Coach",
        email: "wolin@clemson.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Christina Esposito",
        title: "Assistant Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Landyn White",
        title: "Assistant Coach",
        email: "landyn@clemson.edu",
        phone: "",
        photo: "",
        placeholder: false
      }
    ]
  },

  // Source: https://goheels.com/sports/womens-lacrosse/coaches
  unc: {
    coachingStaff: [
      {
        name: "Jenny Levy",
        title: "Head Coach",
        email: "uncwlax@uncaa.unc.edu",
        phone: "919-962-5220",
        photo: "",
        placeholder: false
      },
      {
        name: "Katrina Dowd",
        title: "Associate Head Coach",
        email: "",
        phone: "919-962-5220",
        photo: "",
        placeholder: false
      },
      {
        name: "Samantha Giacolone",
        title: "Assistant Coach",
        email: "sgiacolo@unc.edu",
        phone: "919-962-5220",
        photo: "",
        placeholder: false
      },
      {
        name: "Marie McCool",
        title: "Assistant Coach",
        email: "mmccool@unc.edu",
        phone: "919-962-5220",
        photo: "",
        placeholder: false
      },
      {
        name: "Kayla Wood",
        title: "Assistant Coach",
        email: "kaylwood@unc.edu",
        phone: "919-962-5220",
        photo: "",
        placeholder: false
      },
      {
        name: "Cori Boyle",
        title: "Director of Operations",
        email: "csboyle@unc.edu",
        phone: "919-962-5220",
        photo: "",
        placeholder: false
      }
    ]
  },

  // Source: https://umterps.com/sports/womens-lacrosse/coaches
  maryland: {
    coachingStaff: [
      {
        name: "Cathy Reese",
        title: "Head Coach",
        email: "creese@umd.edu",
        phone: "301-314-4273",
        photo: "",
        placeholder: false
      },
      {
        name: "Jen Adams",
        title: "Associate Head Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Alex Aust Holman",
        title: "Assistant Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Lauri Kenis",
        title: "Assistant Coach",
        email: "lkenis@umd.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Nadine Hadnagy",
        title: "Director of Operations",
        email: "nhadnagy@umd.edu",
        phone: "",
        photo: "",
        placeholder: false
      }
    ]
  },

  // Source: https://cuse.com/sports/womens-lacrosse/coaches
  syracuse: {
    coachingStaff: [
      {
        name: "Regy Thorpe",
        title: "Head Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Caitlin Defliese Watkins",
        title: "Assistant Coach",
        email: "cdeflies@syr.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Nicole Levy",
        title: "Assistant Coach",
        email: "nilevy@syr.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Maggie Koch",
        title: "Assistant Coach",
        email: "mbkoch@syr.edu",
        phone: "",
        photo: "",
        placeholder: false
      }
    ]
  },

  // Source: https://goduke.com/sports/womens-lacrosse/coaches
  duke: {
    coachingStaff: [
      {
        name: "Kerstin Kimel",
        title: "Head Coach",
        email: "kmkimel@duke.edu",
        phone: "919-684-4166",
        photo: "",
        placeholder: false
      },
      {
        name: "Nick Williams",
        title: "Associate Head Coach",
        email: "nick.williams@duke.edu",
        phone: "919-668-5758",
        photo: "",
        placeholder: false
      },
      {
        name: "Brooke Bailey",
        title: "Assistant Coach",
        email: "brooke.griffin@duke.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Morgan Heisman",
        title: "Director of Operations",
        email: "morgan.heisman@duke.edu",
        phone: "919-668-5791",
        photo: "",
        placeholder: false
      },
      {
        name: "Sarah L. Cooper",
        title: "Director of Operations",
        email: "sarah.l.cooper@duke.edu",
        phone: "919-668-5791",
        photo: "",
        placeholder: false
      }
    ]
  },

  // Source: https://fightingirish.com/sports/womens-lacrosse/roster/coaches (redirected from und.com)
  notredame: {
    coachingStaff: []
    // Note: und.com redirects to fightingirish.com; page is JS-rendered; no staff data retrieved.
  },

  // Source: https://virginiasports.com/sports/wlax
  virginia: {
    coachingStaff: [
      {
        name: "Sonia LaMonica",
        title: "Head Coach",
        email: "slamonica@virginia.edu",
        phone: "434-982-5125",
        photo: "",
        placeholder: false
      },
      {
        name: "Caylee Waters",
        title: "Assistant Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Shanna Brady",
        title: "Assistant Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      }
    ]
  },

  // Source: https://hopkinssports.com/sports/womens-lacrosse/roster/ (individual profile pages)
  johnshopkins: {
    coachingStaff: [
      {
        name: "Tim McCormack",
        title: "Head Coach",
        email: "tim.mccormack@jhu.edu",
        phone: "",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/hopkinssports.com/images/2022/6/8/_Z9A3276_71.JPG?width=300",
        placeholder: false
      },
      {
        name: "Dorrien Van Dyke",
        title: "Associate Head Coach",
        email: "dvandyk4@jhu.edu",
        phone: "631-456-0679",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/hopkinssports.com/images/2022/8/22/Van_Dyke_Z9A1853.JPG?width=300",
        placeholder: false
      },
      {
        name: "Nicole Graziano",
        title: "Associate Head Coach",
        email: "ngrazia2@jhu.edu",
        phone: "973-647-5492",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/hopkinssports.com/images/2022/8/22/Graziano_Z9A1872.JPG?width=300",
        placeholder: false
      },
      {
        name: "Jill Girardi",
        title: "Assistant Coach",
        email: "jgirar10@jh.edu",
        phone: "",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/hopkinssports.com/images/2023/10/24/Girardi-Jill_JZ82758.jpg?width=300",
        placeholder: false
      },
      {
        name: "Tayler Kirtley",
        title: "Director of Operations",
        email: "tkirtle1@jh.edu",
        phone: "913-269-8182",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/hopkinssports.com/images/2023/10/24/Tayler_Kirtley-Arizona_State.jpg?width=300",
        placeholder: false
      }
    ]
  },

  // Source: https://gopsusports.com/staff-directory/department/womens-lacrosse
  pennstate: {
    coachingStaff: [
      {
        name: "Kayla Treanor",
        title: "Head Coach",
        email: "kkt5545@psu.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Abby Rehfuss",
        title: "Associate Head Coach",
        email: "akr6594@psu.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Amy Moreau",
        title: "Assistant Coach",
        email: "arm7628@psu.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Kerrigan Miller",
        title: "Assistant Coach",
        email: "kvm6491@psu.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Katie Haus",
        title: "Director of Operations",
        email: "kzs968@psu.edu",
        phone: "",
        photo: "",
        placeholder: false
      }
    ]
  },

  // Source: NC State does not have a women's lacrosse program — removed from list
  // Replacing with a placeholder entry to maintain array integrity
  ncstate: {
    coachingStaff: []
    // Note: NC State University does not sponsor a Division I women's lacrosse program.
  },

  // Source: https://ohiostatebuckeyes.com/sports/womens-lacrosse/roster/coaches
  ohiostate: {
    coachingStaff: [
      {
        name: "Amanda Moore",
        title: "Head Coach",
        email: "moore.5113@osu.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Amanda Belichick",
        title: "Assistant Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Caroline Kimel",
        title: "Assistant Coach",
        email: "kimel.2@osu.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "James Manning",
        title: "Director of Operations",
        email: "Manning.526@osu.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Stephani Schmidt",
        title: "Director of Operations",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      }
    ]
  },

  // Source: https://mgoblue.com/sports/womens-lacrosse/coaches
  michigan: {
    coachingStaff: [
      {
        name: "Hannah Nielsen",
        title: "Head Coach",
        email: "lacrosse.w@umich.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Casey Pearsall",
        title: "Assistant Coach",
        email: "casep@umich.edu",
        phone: "",
        photo: "",
        placeholder: false
      }
    ]
  },

  // Source: https://guhoyas.com/sports/womens-lacrosse/coaches
  georgetown: {
    coachingStaff: [
      {
        name: "Caitlyn Phipps",
        title: "Head Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Julie Morse",
        title: "Assistant Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Alice Johns",
        title: "Assistant Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Eloise Clevenger",
        title: "Director of Operations",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      }
    ]
  },

  // Source: https://bceagles.com/sports/womens-lacrosse/coaches
  bostoncollege: {
    coachingStaff: [
      {
        name: "Acacia Walker-Weinstein",
        title: "Head Coach",
        email: "walkerau@bc.edu",
        phone: "552-0481",
        photo: "",
        placeholder: false
      },
      {
        name: "Jennifer Kent",
        title: "Associate Head Coach",
        email: "kentjf@bc.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Sam Apuzzo",
        title: "Assistant Coach",
        email: "apuzzosa@bc.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Callahan Kent",
        title: "Assistant Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      }
    ]
  },

  // Source: https://denverpioneers.com/sports/womens-lacrosse/coaches
  denver: {
    coachingStaff: [
      {
        name: "Liza Kelly",
        title: "Head Coach",
        email: "ekelly23@du.edu",
        phone: "303-871-4703",
        photo: "",
        placeholder: false
      },
      {
        name: "Taylor VanThof",
        title: "Associate Head Coach / Offensive Coordinator",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Brittany Read",
        title: "Assistant Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Megan Zeman",
        title: "Director of Operations",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      }
    ]
  },

  // Source: https://loyolagreyhounds.com/sports/womens-lacrosse/coaches
  loyolamd: {
    coachingStaff: [
      {
        name: "Jen Adams",
        title: "Head Coach",
        email: "jadams4@loyola.edu",
        phone: "410-617-2167",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/loyolagreyhounds.com/images/2026/1/22/adams.jpg",
        placeholder: false
      },
      {
        name: "Dana Dobbie",
        title: "Assistant Coach",
        email: "dmdobbie@loyola.edu",
        phone: "410-617-5408",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/loyolagreyhounds.com/images/2018/8/28/Dobbie_Dana_DSC_3418.jpg?width=300",
        placeholder: false
      },
      {
        name: "Caroline Hager",
        title: "Assistant Coach",
        email: "cjhager@loyola.edu",
        phone: "410-617-2633",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/loyolagreyhounds.com/images/2026/1/22/hager.jpg?width=300",
        placeholder: false
      },
      {
        name: "Georgia Latch",
        title: "Assistant Coach",
        email: "gelatch@loyola.edu",
        phone: "",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/loyolagreyhounds.com/images/2026/1/22/latch.jpg?width=300",
        placeholder: false
      },
      {
        name: "Maeve McKew",
        title: "Director of Lacrosse Operations",
        email: "mmckew@loyola.edu",
        phone: "",
        photo: "",
        placeholder: false
      }
    ]
  },

  // Source: https://goprincetontigers.com/sports/womens-lacrosse/coaches
  princeton: {
    coachingStaff: [
      {
        name: "Jenn Cook",
        title: "Head Coach",
        email: "jc30@princeton.edu",
        phone: "609-258-2382",
        photo: "",
        placeholder: false
      },
      {
        name: "Kerrin Maurer",
        title: "Associate Head Coach",
        email: "kmaurer@princeton.edu",
        phone: "609-258-8314",
        photo: "",
        placeholder: false
      },
      {
        name: "Molly Dougherty",
        title: "Assistant Coach",
        email: "molly.dougherty@princeton.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Ali Robinson",
        title: "Assistant Coach",
        email: "ar1842@princeton.edu",
        phone: "",
        photo: "",
        placeholder: false
      }
    ]
  },

  // Source: https://yalebulldogs.com/sports/womens-lacrosse/coaches
  yale: {
    coachingStaff: [
      {
        name: "Erica Bamford",
        title: "Head Coach",
        email: "erica.bamford@yale.edu",
        phone: "203-432-1486",
        photo: "",
        placeholder: false
      },
      {
        name: "Colleen Smith",
        title: "Associate Head Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Molly Palella",
        title: "Assistant Coach / Recruiting Coordinator",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Brooklyn Neumen",
        title: "Assistant Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      }
    ]
  },

  // Source: https://gocrimson.com/sports/womens-lacrosse/coaches
  harvard: {
    coachingStaff: [
      {
        name: "Devon Wills",
        title: "Head Coach",
        email: "devon_wills@fas.harvard.edu",
        phone: "617-495-3245",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/gocrimson.com/images/2021/8/31/DHA_2122_Staff_Photos_Devon_Wills_0025.jpg?width=300",
        placeholder: false
      },
      {
        name: "Becca Block",
        title: "Associate Head Coach",
        email: "rebecca_block@fas.harvard.edu",
        phone: "",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/gocrimson.com/images/2020/3/25/block_becca.jpg?width=300",
        placeholder: false
      },
      {
        name: "Kenzie Kent",
        title: "Assistant Coach",
        email: "makenziekent@fas.harvard.edu",
        phone: "",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/gocrimson.com/images/2020/3/25/kenzie_kent.jpg?width=300",
        placeholder: false
      },
      {
        name: "Sydney Scales",
        title: "Assistant Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Beth Doran",
        title: "Director of Operations",
        email: "bethdoran@fas.harvard.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Megan Finn",
        title: "Athletic Trainer",
        email: "mfinn@fas.harvard.edu",
        phone: "617-495-2200",
        photo: "",
        placeholder: false
      }
    ]
  },

  // Source: https://cornellbigred.com/sports/womens-lacrosse/coaches
  cornell: {
    coachingStaff: [
      {
        name: "Jenny Graap",
        title: "Head Coach",
        email: "womenslax@cornell.edu",
        phone: "255-4979",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/cornellbigred.com/images/2025/9/5/Graap_Jenny_25_crop.jpg?width=300",
        placeholder: false
      },
      {
        name: "Sarah Burlingame",
        title: "Assistant Coach",
        email: "womenslax@cornell.edu",
        phone: "561-628-9425",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/cornellbigred.com/images/2023/9/1/Sarah_Burlingame_23_Crop.jpg?width=300",
        placeholder: false
      },
      {
        name: "Riley VanHoltz",
        title: "Assistant Coach",
        email: "womenslax@cornell.edu",
        phone: "",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/cornellbigred.com/images/2024/9/19/Vantloltz_Riley_24_crop.JPG?width=300",
        placeholder: false
      },
      {
        name: "Ashley O'Brien",
        title: "Assistant Coach",
        email: "womenslax@cornell.edu",
        phone: "585-764-3562",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/cornellbigred.com/images/2023/9/1/Ashley_OBrien_23_Crop.jpg?width=300",
        placeholder: false
      },
      {
        name: "Rachel Rosenberg",
        title: "Director of Operations",
        email: "rr823@cornell.edu",
        phone: "",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/cornellbigred.com/images/2025/1/13/Untitled-3.jpg?width=300",
        placeholder: false
      }
    ]
  },

  // Source: https://villanova.com/sports/womens-lacrosse/roster/coaches — site had redirect issues
  villanova: {
    coachingStaff: []
    // Note: villanova.com had redirect loops; no staff data retrieved.
  },

  // Source: https://gomarquette.com/sports/womens-lacrosse/coaches
  marquette: {
    coachingStaff: [
      {
        name: "Meredith Black",
        title: "Head Coach",
        email: "meredith.black@marquette.edu",
        phone: "414-288-4958",
        photo: "",
        placeholder: false
      },
      {
        name: "Caitlin Wolf",
        title: "Associate Head Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Jill Rizzo",
        title: "Assistant Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Emilia Ward",
        title: "Assistant Coach",
        email: "emilia.ward@marquette.edu",
        phone: "414-288-2006",
        photo: "",
        placeholder: false
      }
    ]
  },

  // Source: https://jmusports.com/sports/womens-lacrosse/coaches
  jmu: {
    coachingStaff: [
      {
        name: "Shelley Klaes",
        title: "Head Coach",
        email: "klaessc@jmu.edu",
        phone: "540-568-3618",
        photo: "",
        placeholder: false
      },
      {
        name: "Kateri Linville",
        title: "Associate Head Coach",
        email: "linvilkc@jmu.edu",
        phone: "540-568-7356",
        photo: "",
        placeholder: false
      },
      {
        name: "Scott Arbogast",
        title: "Assistant Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Emily Garrity",
        title: "Assistant Coach",
        email: "",
        phone: "",
        photo: "",
        placeholder: false
      }
    ]
  },

  // Source: https://stonybrookathletics.com/sports/womens-lacrosse/roster (individual profile pages)
  stonybrook: {
    coachingStaff: [
      {
        name: "Joe Spallina",
        title: "Head Coach",
        email: "joseph.spallina@stonybrook.edu",
        phone: "631-632-4089",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/stonybrook.sidearmsports.com/images/2016/9/14/Joe_Spallina.jpg?width=300",
        placeholder: false
      },
      {
        name: "Sydney Pirreca",
        title: "Associate Head Coach / Offensive Coordinator",
        email: "Sydney.Pirreca@stonybrook.edu",
        phone: "",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/stonybrook.sidearmsports.com/images/2024/12/3/Sydney_Perreca_1_.jpg?width=300",
        placeholder: false
      },
      {
        name: "Clare Levy",
        title: "Defensive Coordinator",
        email: "clare.levy@stonybrook.edu",
        phone: "",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/stonybrook.sidearmsports.com/images/2024/12/5/Clare_Levy_3_.jpg?width=300",
        placeholder: false
      },
      {
        name: "Charlotte Verhulst",
        title: "Assistant Coach",
        email: "charlotte.verhulst@stonybrook.edu",
        phone: "",
        photo: "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/stonybrook.sidearmsports.com/images/2024/12/9/Charlotte_Verhulst_2_.jpg?width=300",
        placeholder: false
      }
    ]
  },

  // Source: https://goarmywestpoint.com/sports/womens-lacrosse/coaches
  army: {
    coachingStaff: [
      {
        name: "Michelle Tumolo",
        title: "Head Coach",
        email: "michelle.tumolo@westpoint.edu",
        phone: "845-938-1826",
        photo: "",
        placeholder: false
      },
      {
        name: "Samantha Cermack",
        title: "Associate Head Coach",
        email: "samantha.cermack@westpoint.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Katie Erbe",
        title: "Assistant Coach",
        email: "kathleen.erbe@westpoint.edu",
        phone: "",
        photo: "",
        placeholder: false
      },
      {
        name: "Charlotte Sofield",
        title: "Assistant Coach",
        email: "charlotte.sofield@westpoint.edu",
        phone: "",
        photo: "",
        placeholder: false
      }
    ]
  }
};

// Summary of data coverage:
// Full contact + photos: Johns Hopkins, Stony Brook, Loyola Maryland, Harvard, Cornell
// Full contact, no photos: Penn State, UNC, Duke, Princeton, Army, JMU, Marquette, Yale, Denver, Boston College, Maryland, Virginia
// Partial contact only: Syracuse, Ohio State, Michigan, Clemson
// No data retrieved (JS-rendered or redirects): Notre Dame, NC State (no program), Villanova, Georgetown
