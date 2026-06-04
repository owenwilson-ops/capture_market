// Training plan data for all 5 skill-focused 90-minute lacrosse development plans.
// All blocks are structured as: startTime (string), duration (minutes), title, phase, locked, drills[].

export const TRAINING_PLANS = [
  // ─────────────────────────────────────────────────────────────────────────────
  // PLAN 1: SHOOTING HEAVY
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "shooting-heavy",
    title: "Shooting Heavy",
    focus: "Mechanics · Accuracy · Form Under Fatigue",
    totalMinutes: 90,
    blocks: [
      {
        id: "sh-b1",
        startTime: "0:00",
        duration: 20,
        title: "Wall Ball",
        phase: "Non-Negotiable Warm-Up",
        locked: true,
        drills: [
          {
            num: "01",
            name: "Quick Stick — Dominant Hand",
            tag: "Eyes Up",
            tagType: "lock",
            description: "Right-to-right passes at full speed. Catching position before the ball arrives. Never break your eyes off an imaginary midfield target.",
            sets: "100 reps · dominant hand"
          },
          {
            num: "02",
            name: "Quick Stick — Non-Dominant Hand",
            tag: "Weak Hand",
            tagType: "skill",
            description: "Same protocol, opposite hand. If your non-dominant hand breaks down before 50 reps, you have a training debt. No cross-body catches — meet the ball with a clean pocket.",
            sets: "100 reps · non-dominant hand"
          },
          {
            num: "03",
            name: "High-to-Low Release Wall Bounce",
            tag: "Release Point",
            tagType: "skill",
            description: "Throw high on the wall, catch the bounce at hip height, and immediately reload for a shooting release position. This trains the exact hand position you need after catching a feed on the crease.",
            sets: "3 sets × 20 reps"
          }
        ]
      },
      {
        id: "sh-b2",
        startTime: "0:20",
        duration: 15,
        title: "Shooting Mechanics",
        phase: "Non-Negotiable Warm-Up",
        locked: true,
        drills: [
          {
            num: "04",
            name: "Stationary Form Shooting — Near Pipe",
            tag: "Form First",
            tagType: "lock",
            description: "Set up 5 yards from the pipe. No wind-up. Hips rotate through the shot, front shoulder pulls, and the ball goes low pipe. Do not add speed until every rep is hitting the target.",
            sets: "10 reps · each pipe"
          },
          {
            num: "05",
            name: "Step-In Shooting — Hip Rotation",
            tag: "Drive Through",
            tagType: "skill",
            description: "One step into the shot. Your lower half initiates — the stick is the last thing to move. If your arm fires before your hips open, the shot has a ceiling. Reset and go again.",
            sets: "3 sets × 8 reps"
          },
          {
            num: "06",
            name: "Overload Catch and Shoot",
            tag: "Catch Rate",
            tagType: "skill",
            description: "Partner or rebounder feeds you high, then low, then left, then right in sequence. Catch and shoot within one second. No cradling between the feed and the release.",
            sets: "4 rounds × 5-feed sequences"
          }
        ]
      },
      {
        id: "sh-b3",
        startTime: "0:35",
        duration: 15,
        title: "Angle Shooting",
        phase: "Primary Work",
        locked: false,
        drills: [
          {
            num: "07",
            name: "X-Slot Drive and Shoot",
            tag: "Angle",
            tagType: "skill",
            description: "From X behind cage, drive right to the right-side slot and shoot near-pipe low. Do not curl inside the crease. The angle forces you to keep hips open through the finish.",
            sets: "5 reps · right, 5 reps · left"
          },
          {
            num: "08",
            name: "45-Degree Cut Feed",
            tag: "Catch and Shoot",
            tagType: "skill",
            description: "Wing attacker cuts at 45 degrees to the crease. Feeder hits the stick on a timing pass. Catch, plant the lead foot, and release before the defender closes. No holding the ball.",
            sets: "3 sets × 6 reps each wing"
          },
          {
            num: "09",
            name: "Shovel Shot at Crease",
            tag: "Tight Angle",
            tagType: "skill",
            description: "From 2 yards off the crease edge, simulate a saved dodge. Defender's body is in your lane. Shovel the ball low-far-post with a snap of the wrists. This is an emergency shot — practice it at game speed.",
            sets: "4 sets × 4 reps"
          }
        ]
      },
      {
        id: "sh-b4",
        startTime: "0:50",
        duration: 20,
        title: "Shot Placement Under Fatigue",
        phase: "Primary Work",
        locked: false,
        drills: [
          {
            num: "10",
            name: "Three-Cone Sprint to Shot",
            tag: "Fatigue Shooting",
            tagType: "compete",
            description: "Sprint a 20-yard three-cone sequence, receive a feed at the top of the box, and shoot within 1 second. This is about maintaining form when your legs are gone. You do not get to be pretty — you get to be accurate.",
            sets: "8 reps · 30 seconds rest between"
          },
          {
            num: "11",
            name: "Post-Dodge Low-to-High",
            tag: "Shot Arc",
            tagType: "skill",
            description: "Simulate a roll dodge on the side of the crease. After the dodge, your hips are already open — shoot low-to-high with the momentum of the dodge rather than resetting. The dodge is the wind-up.",
            sets: "5 reps · each side"
          },
          {
            num: "12",
            name: "Shoot-Recover-Shoot",
            tag: "Offensive Pressure",
            tagType: "compete",
            description: "First shot is a full-speed attempt on cage. Immediately follow your shot, collect the rebound or missed ball, and shoot again within 3 seconds. Goalies do not give up rebounds — neither should you.",
            sets: "3 sets × 5 reps"
          },
          {
            num: "13",
            name: "Contested Shooting — Live Defender",
            tag: "Game Speed",
            tagType: "compete",
            description: "Defender plays live but does not check the stick until the release. Attack player must read the defender's body position and choose shot side accordingly. No pre-determined shots.",
            sets: "10 reps total"
          }
        ]
      },
      {
        id: "sh-b5",
        startTime: "1:10",
        duration: 10,
        title: "Conditioning Finish",
        phase: "Conditioning",
        locked: false,
        drills: [
          {
            num: "14",
            name: "Full-Field Sprint with Shot",
            tag: "Transition",
            tagType: "compete",
            description: "Sprint full-field with the ball in your stick. Arrive at the box at full speed and shoot low corner. No slowing down to set up. D1 attackers get the ball in space on the run — this is the rep that builds that.",
            sets: "5 reps · alternate sides"
          },
          {
            num: "15",
            name: "Line Sprints",
            tag: "Conditioning",
            tagType: "conditioning",
            description: "Four lines, goal line to midfield and back. No stick. This is pure legs. Finish every sprint through the line — not to it.",
            sets: "4 rounds"
          }
        ]
      },
      {
        id: "sh-b6",
        startTime: "1:20",
        duration: 10,
        title: "Cool-Down",
        phase: "Recovery",
        locked: false,
        drills: [
          {
            num: "16",
            name: "Hip Flexor and Quad Stretch",
            tag: "Recovery",
            tagType: "recovery",
            description: "Lunge stretch with a 30-second hold per side. Shooting puts enormous demand on the hip flexors — if you skip this, they tighten overnight and your first step the next day is slower.",
            sets: "2 rounds · 30 sec each side"
          },
          {
            num: "17",
            name: "Shoulder External Rotation",
            tag: "Arm Care",
            tagType: "recovery",
            description: "Band or manual resistance, 15 slow reps per arm. Your throwing shoulder absorbs the load of every shooting rep. Skipping shoulder care is how careers get cut short.",
            sets: "15 reps · each arm"
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PLAN 2: FOOTWORK FOCUS
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "footwork-focus",
    title: "Footwork Focus",
    focus: "Lateral Speed · Cuts · First Step",
    totalMinutes: 90,
    blocks: [
      {
        id: "ff-b1",
        startTime: "0:00",
        duration: 20,
        title: "Wall Ball",
        phase: "Non-Negotiable Warm-Up",
        locked: true,
        drills: [
          {
            num: "01",
            name: "Quick Stick — Dominant Hand",
            tag: "Eyes Up",
            tagType: "lock",
            description: "Right-to-right passes at full speed. Catching position before the ball arrives. Never break your eyes off an imaginary midfield target.",
            sets: "100 reps · dominant hand"
          },
          {
            num: "02",
            name: "Split Dodge Wall Catch",
            tag: "Footwork",
            tagType: "skill",
            description: "Execute a full split dodge footwork pattern between each wall-ball rep. Plant, switch hands, and receive the next pass in the correct hand. The footwork and the stick skill are trained together, not in isolation.",
            sets: "3 sets × 15 reps"
          },
          {
            num: "03",
            name: "Lateral Skip and Catch",
            tag: "Lateral Load",
            tagType: "skill",
            description: "Stand 5 yards from the wall and skip laterally before each catch. Your body is moving when the ball arrives — train catches when you are not planted. This is the rep that carries into game situations.",
            sets: "3 sets × 12 reps each direction"
          }
        ]
      },
      {
        id: "ff-b2",
        startTime: "0:20",
        duration: 15,
        title: "Shooting Mechanics",
        phase: "Non-Negotiable Warm-Up",
        locked: true,
        drills: [
          {
            num: "04",
            name: "Stationary Form Shooting — Near Pipe",
            tag: "Form First",
            tagType: "lock",
            description: "Set up 5 yards from the pipe. No wind-up. Hips rotate through the shot, front shoulder pulls, and the ball goes low pipe. Do not add speed until every rep is hitting the target.",
            sets: "10 reps · each pipe"
          },
          {
            num: "05",
            name: "Step-In Release from Cut",
            tag: "Cut and Shoot",
            tagType: "skill",
            description: "Cut hard toward the ball, plant, and release without extra steps. The plant foot is the last step before the ball leaves the stick. No gather steps — fielding the cut and getting off the shot in one motion is the skill.",
            sets: "4 sets × 6 reps"
          },
          {
            num: "06",
            name: "Moving Target — Two-Step Shooting",
            tag: "Footwork into Shot",
            tagType: "skill",
            description: "From the wing, two hard steps toward cage and shoot. Step-step-release, no stopping. The only goal is keeping your base under you through the release.",
            sets: "3 sets × 8 reps each side"
          }
        ]
      },
      {
        id: "ff-b3",
        startTime: "0:35",
        duration: 15,
        title: "First Step and Change of Direction",
        phase: "Primary Work",
        locked: false,
        drills: [
          {
            num: "07",
            name: "5-10-5 Shuttle",
            tag: "COD Speed",
            tagType: "compete",
            description: "Five yards right, ten yards left, five yards right. Drive off the plant foot hard enough that you do not skid into the cut. Record your time and beat it. Your first step out of the cut is what coaches look at on film.",
            sets: "6 reps · 45-second rest"
          },
          {
            num: "08",
            name: "L-Cut to Catch",
            tag: "Cut Timing",
            tagType: "skill",
            description: "Plant both feet at the top of the L, drive off the inside foot, and make your cut on an exact line. Feeder throws the ball the moment you plant. If you are not in position when the ball arrives, the cut was wrong.",
            sets: "5 reps · each direction"
          },
          {
            num: "09",
            name: "V-Cut Release Drill",
            tag: "Separation",
            tagType: "skill",
            description: "Set up a defender in man coverage. Sell the fade, plant hard, and drive back toward the ball. The separation window is one step — use it or it closes. Catch at the top of your route and get eyes downfield immediately.",
            sets: "4 sets × 5 reps"
          }
        ]
      },
      {
        id: "ff-b4",
        startTime: "0:50",
        duration: 20,
        title: "Dodge Footwork — Full Speed",
        phase: "Primary Work",
        locked: false,
        drills: [
          {
            num: "10",
            name: "Split Dodge Full Speed",
            tag: "Dodge",
            tagType: "skill",
            description: "Approach top of the box at full sprint. Plant hard on the inside foot, switch hands in one fluid motion, and accelerate through the crease. The dodge is worthless if you do not accelerate out of it — deceleration is the tell.",
            sets: "8 reps · alternate sides"
          },
          {
            num: "11",
            name: "Roll Dodge with Immediate Feed",
            tag: "Dodge into Pass",
            tagType: "skill",
            description: "After the roll, your eyes find the feeder immediately. No cradling, no resetting. The pass comes off the back shoulder of the roll in one connected motion. If your hips are not through the roll, the pass is late.",
            sets: "5 reps · each side"
          },
          {
            num: "12",
            name: "Stutter Dodge — Reading the Defender",
            tag: "IQ",
            tagType: "compete",
            description: "Live 1v1 from top of box to crease. Attacker decides dodge type at contact based on defender's hips. No pre-set dodge. Decision is made in real time. Defenders play honest — no conceding early.",
            sets: "10 live reps"
          },
          {
            num: "13",
            name: "Catch Footwork — Off-Balance Feed",
            tag: "Body Control",
            tagType: "skill",
            description: "Feeder throws wide, short, and behind the cutter intentionally. Attacker adjusts footwork to make the catch and immediately get a shot off. D1 feeds are not perfect — get used to adjusting your base to the ball.",
            sets: "3 sets × 8 reps"
          }
        ]
      },
      {
        id: "ff-b5",
        startTime: "1:10",
        duration: 10,
        title: "Conditioning Finish",
        phase: "Conditioning",
        locked: false,
        drills: [
          {
            num: "14",
            name: "Ladder Footwork at Max Speed",
            tag: "Foot Speed",
            tagType: "conditioning",
            description: "Agility ladder, 5 patterns back to back with no rest between patterns. Icky shuffle, two-in/two-out, lateral crossover, single-leg hop, and sprint out. Move at maximum speed — slow ladder work is not development, it is choreography.",
            sets: "4 rounds"
          },
          {
            num: "15",
            name: "400-Meter Sprint Effort",
            tag: "Conditioning",
            tagType: "conditioning",
            description: "One lap at near-max effort. Hold your form through the final 100 meters. This is the rep that builds the ability to cut hard in the fourth quarter.",
            sets: "2 reps · 90-second rest"
          }
        ]
      },
      {
        id: "ff-b6",
        startTime: "1:20",
        duration: 10,
        title: "Cool-Down",
        phase: "Recovery",
        locked: false,
        drills: [
          {
            num: "16",
            name: "Hamstring and Glute Stretch",
            tag: "Recovery",
            tagType: "recovery",
            description: "Standing hamstring stretch into a seated figure-four. Thirty seconds per side, no bouncing. Your first step speed lives in your posterior chain — if it is tight, your cuts are slow and you do not know why.",
            sets: "2 rounds · 30 sec each side"
          },
          {
            num: "17",
            name: "Calf and Ankle Mobility",
            tag: "Foot Health",
            tagType: "recovery",
            description: "Wall calf stretch with ankle circles. Lateral cuts load the ankle joint on every rep. This is not optional maintenance — it is injury prevention with a direct line to your on-field output.",
            sets: "30 sec each side · 2 rounds"
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PLAN 3: STICK AND GROUND BALLS
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "stick-and-ground-balls",
    title: "Stick and Ground Balls",
    focus: "Ball Security · Ground Ball Aggression · Possession",
    totalMinutes: 90,
    blocks: [
      {
        id: "sgb-b1",
        startTime: "0:00",
        duration: 20,
        title: "Wall Ball",
        phase: "Non-Negotiable Warm-Up",
        locked: true,
        drills: [
          {
            num: "01",
            name: "Quick Stick — Dominant Hand",
            tag: "Eyes Up",
            tagType: "lock",
            description: "Right-to-right passes at full speed. Catching position before the ball arrives. Never break your eyes off an imaginary midfield target.",
            sets: "100 reps · dominant hand"
          },
          {
            num: "02",
            name: "Behind-the-Back Wall Ball",
            tag: "Ball Security",
            tagType: "skill",
            description: "Throw behind the back, catch with the dominant hand in a protected position. This forces you to feel the pocket without looking at the stick. Ball security starts with knowing where your stick is without visual reference.",
            sets: "3 sets × 20 reps"
          },
          {
            num: "03",
            name: "Low-Wall Bounce Pass",
            tag: "Ground Level",
            tagType: "skill",
            description: "Throw at the base of the wall and scoop the bounce off the ground cleanly. Every rep is a ground ball. Scoop technique: low hand drives the butt end of the stick into the ground before the ball, and you accelerate through the pick-up.",
            sets: "3 sets × 25 reps"
          }
        ]
      },
      {
        id: "sgb-b2",
        startTime: "0:20",
        duration: 15,
        title: "Shooting Mechanics",
        phase: "Non-Negotiable Warm-Up",
        locked: true,
        drills: [
          {
            num: "04",
            name: "Stationary Form Shooting — Near Pipe",
            tag: "Form First",
            tagType: "lock",
            description: "Set up 5 yards from the pipe. No wind-up. Hips rotate through the shot, front shoulder pulls, and the ball goes low pipe. Do not add speed until every rep is hitting the target.",
            sets: "10 reps · each pipe"
          },
          {
            num: "05",
            name: "Ground Ball to Shot",
            tag: "Pickup and Shoot",
            tagType: "skill",
            description: "Ball is placed on the ground 10 yards from cage. Player scoops at full speed and immediately shoots. No extra steps between the scoop and the shot. This is one motion.",
            sets: "5 reps · each side"
          },
          {
            num: "06",
            name: "Cradle Under Pressure — Shooting",
            tag: "Protection",
            tagType: "skill",
            description: "Partner applies passive stick pressure on the shooting arm while the player shoots. Maintain shooting form with a compromised stick. If your form collapses under light pressure, it will collapse in games.",
            sets: "3 sets × 6 reps"
          }
        ]
      },
      {
        id: "sgb-b3",
        startTime: "0:35",
        duration: 15,
        title: "Ground Ball Mechanics",
        phase: "Primary Work",
        locked: false,
        drills: [
          {
            num: "07",
            name: "Contested Ground Ball — Head On",
            tag: "50/50",
            tagType: "compete",
            description: "Two players start 10 yards apart, ball is rolled between them. Winner is the first to gain possession and get their shoulder past the defender. Winning ground balls head-on requires body position, not just stick speed.",
            sets: "10 reps · alternate who has the advantage"
          },
          {
            num: "08",
            name: "Ground Ball to Outlet Pass",
            tag: "Possession Transition",
            tagType: "skill",
            description: "Scoop a ground ball and immediately make a crisp outlet pass to a teammate 15 yards up the field. The pick-up and the outlet are one continuous play. If you stop your feet after the scoop, you are already too slow.",
            sets: "4 sets × 6 reps"
          },
          {
            num: "09",
            name: "Box-Out Ground Ball",
            tag: "Body Position",
            tagType: "compete",
            description: "Ball is loose near the crease. Attacker boxes out the defender using their body before scooping. The shoulder must be between the defender and the ball. No reaching around a body — go through it.",
            sets: "8 reps"
          }
        ]
      },
      {
        id: "sgb-b4",
        startTime: "0:50",
        duration: 20,
        title: "Ball Security and Stick Protection",
        phase: "Primary Work",
        locked: false,
        drills: [
          {
            num: "10",
            name: "Cradle Gauntlet",
            tag: "Ball Security",
            tagType: "compete",
            description: "Two defenders line up 3 yards apart, player runs between them. Both defenders attempt to dislodge the ball with stick checks only. Player must protect the stick and maintain possession through both check attempts. If you lose the ball, you repeat the rep.",
            sets: "5 reps each direction"
          },
          {
            num: "11",
            name: "Running Cradle — Change of Direction",
            tag: "Protection in Space",
            tagType: "skill",
            description: "Cradle at full speed through a cone course. On every cut, switch the stick to the outside hand to protect it from the inside defender. The switch must happen before the cut, not after.",
            sets: "3 runs · each direction"
          },
          {
            num: "12",
            name: "Two-on-One Ground Ball",
            tag: "Decision Under Pressure",
            tagType: "compete",
            description: "Ball is loose, 2 offensive players versus 1 defender. Offensive players must pick up the ball and make the correct pass immediately. If the player with the ball holds it while the teammate is open, it is a failed rep — start over.",
            sets: "8 reps"
          },
          {
            num: "13",
            name: "Stick Check Resistance",
            tag: "Contact",
            tagType: "compete",
            description: "Defender applies a full legal poke check from behind. Ball carrier drives forward through the check and protects the pocket. This is a physical rep. Take the contact, keep the ball, keep moving.",
            sets: "10 reps"
          }
        ]
      },
      {
        id: "sgb-b5",
        startTime: "1:10",
        duration: 10,
        title: "Conditioning Finish",
        phase: "Conditioning",
        locked: false,
        drills: [
          {
            num: "14",
            name: "Ground Ball Suicide",
            tag: "Conditioning",
            tagType: "conditioning",
            description: "Sprint to a ground ball at 10 yards, scoop and sprint back, place ball. Sprint to 20 yards, scoop, sprint back. Continue to 30 and 40 yards. This is a conditioning drill disguised as a skill drill — because the skill test comes when you are exhausted.",
            sets: "3 rounds · 60-second rest"
          },
          {
            num: "15",
            name: "Bear Crawl with Ball Protection",
            tag: "Core and Stick",
            tagType: "conditioning",
            description: "Bear crawl 20 yards while maintaining a cradle with the dominant hand. Your core and your stick skill are being tested simultaneously. Keep the ball in the pocket.",
            sets: "4 lengths"
          }
        ]
      },
      {
        id: "sgb-b6",
        startTime: "1:20",
        duration: 10,
        title: "Cool-Down",
        phase: "Recovery",
        locked: false,
        drills: [
          {
            num: "16",
            name: "Forearm and Wrist Stretch",
            tag: "Recovery",
            tagType: "recovery",
            description: "Extend arm, pull fingers back with opposite hand, hold 30 seconds. Ground ball work puts repetitive stress on the wrists and forearms. Do not skip this if you plan to practice tomorrow.",
            sets: "2 rounds · each arm"
          },
          {
            num: "17",
            name: "Thoracic Spine Rotation",
            tag: "Mobility",
            tagType: "recovery",
            description: "Seated with feet flat, rotate torso 90 degrees each direction with a hold at the end range. The rotational power in your throw and your dodge both begin in the thoracic spine.",
            sets: "10 reps each side"
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PLAN 4: DODGE AND FINISH
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "dodge-and-finish",
    title: "Dodge and Finish",
    focus: "Attack Skill · Drive and Draw · Finishing Around the Cage",
    totalMinutes: 90,
    blocks: [
      {
        id: "df-b1",
        startTime: "0:00",
        duration: 20,
        title: "Wall Ball",
        phase: "Non-Negotiable Warm-Up",
        locked: true,
        drills: [
          {
            num: "01",
            name: "Quick Stick — Dominant Hand",
            tag: "Eyes Up",
            tagType: "lock",
            description: "Right-to-right passes at full speed. Catching position before the ball arrives. Never break your eyes off an imaginary midfield target.",
            sets: "100 reps · dominant hand"
          },
          {
            num: "02",
            name: "Catch-Feed-Catch Wall Combination",
            tag: "Hands",
            tagType: "skill",
            description: "Throw dominant, catch non-dominant, throw non-dominant, catch dominant. Continuous cycle with no pause between catches. This builds the ambidextrous reflex you need to finish around the crease after a dodge.",
            sets: "3 sets × 30 cycles"
          },
          {
            num: "03",
            name: "One-Handed Catch — Weak Hand",
            tag: "Catch Radius",
            tagType: "skill",
            description: "Throw at full speed, extend the non-dominant arm, and catch with one hand only. Do not support with the dominant hand. Finish on the far side of the cage requires making catches in tight spaces at odd angles.",
            sets: "2 sets × 20 reps"
          }
        ]
      },
      {
        id: "df-b2",
        startTime: "0:20",
        duration: 15,
        title: "Shooting Mechanics",
        phase: "Non-Negotiable Warm-Up",
        locked: true,
        drills: [
          {
            num: "04",
            name: "Stationary Form Shooting — Near Pipe",
            tag: "Form First",
            tagType: "lock",
            description: "Set up 5 yards from the pipe. No wind-up. Hips rotate through the shot, front shoulder pulls, and the ball goes low pipe. Do not add speed until every rep is hitting the target.",
            sets: "10 reps · each pipe"
          },
          {
            num: "05",
            name: "Crease Finish — Backhand",
            tag: "Backhand",
            tagType: "skill",
            description: "From 3 yards off the crease, shoot backhand low-far-post. Most players do not have a backhand finish — this is why defenders overshade to the strong side. Build it and use it.",
            sets: "4 sets × 5 reps each side"
          },
          {
            num: "06",
            name: "Behind-the-Back Feed and Finish",
            tag: "Advanced Finish",
            tagType: "skill",
            description: "Drive baseline, draw the goalie, deliver a behind-the-back pass to a cutter for the finish. The pass must be off the correct hip. If the goalie does not bite on your movement, you do not have a full-speed draw.",
            sets: "5 reps each side"
          }
        ]
      },
      {
        id: "df-b3",
        startTime: "0:35",
        duration: 15,
        title: "Dodge Combinations",
        phase: "Primary Work",
        locked: false,
        drills: [
          {
            num: "07",
            name: "Hitch Dodge — Reading Help Defense",
            tag: "Hitch",
            tagType: "skill",
            description: "Fake the feed, hold until the slide commits, then drive. The hitch is not a stutter — it is a genuine fake that makes defenders move their feet. If the slide does not react, you did not sell it.",
            sets: "6 reps top · 6 reps wing"
          },
          {
            num: "08",
            name: "Face Dodge to X",
            tag: "Reversal",
            tagType: "skill",
            description: "Drive from the wing, face dodge the on-ball defender, and continue behind cage to X. The face dodge only works if you have already sold the shot. Without a credible shot threat, the defender will not bite.",
            sets: "5 reps each wing"
          },
          {
            num: "09",
            name: "Step-Down Dodge",
            tag: "Crease Drive",
            tagType: "skill",
            description: "From the crease edge, step down toward the end line to take a defender out of position, then explode back upfield to the shot. The step-down is designed to move the defender's hips — watch their feet, not their hands.",
            sets: "8 reps"
          }
        ]
      },
      {
        id: "df-b4",
        startTime: "0:50",
        duration: 20,
        title: "Finishing Around the Cage",
        phase: "Primary Work",
        locked: false,
        drills: [
          {
            num: "10",
            name: "Drive and Draw — Two-on-Two",
            tag: "Draw the Double",
            tagType: "compete",
            description: "Two attackers versus two defenders. Primary attacker drives to draw the slide. The moment the slide commits, the ball must be off. If you hold the ball past the slide's commitment, you have already failed the rep.",
            sets: "10 reps · alternate who drives"
          },
          {
            num: "11",
            name: "Reverse Pivot Finish",
            tag: "Crease Finish",
            tagType: "skill",
            description: "Catch at the crease, feel the defender behind you, reverse pivot to the open side, and shoot in one motion. The pivot is generated from the hips — not the shoulders. Your stick goes where your hips point.",
            sets: "5 reps each direction"
          },
          {
            num: "12",
            name: "Three-Man Weave to Finish",
            tag: "Transition",
            tagType: "compete",
            description: "Full-field three-man weave finishing with a live shot on cage. The finisher must call for the ball at the right time — not too early, not late. If the finisher does not call, the play dies.",
            sets: "8 reps"
          },
          {
            num: "13",
            name: "Live 1v1 to Cage — No Second Chances",
            tag: "Finish Rate",
            tagType: "compete",
            description: "One shot per rep, one chance to score. Defender plays full contact once the attacker enters the box. Track your finish rate across 10 reps. You should be scoring on better than 50 percent of your looks.",
            sets: "10 reps"
          }
        ]
      },
      {
        id: "df-b5",
        startTime: "1:10",
        duration: 10,
        title: "Conditioning Finish",
        phase: "Conditioning",
        locked: false,
        drills: [
          {
            num: "14",
            name: "Dodge Sprint Series",
            tag: "Dodge Conditioning",
            tagType: "conditioning",
            description: "Sprint from midfield to the box, execute a split dodge at the top, and finish on cage. Immediately sprint back to midfield. This is your transition conditioning — every rep ends with a shot, not a jog.",
            sets: "8 reps · 20-second rest"
          },
          {
            num: "15",
            name: "Interval Runs — Field Length",
            tag: "Conditioning",
            tagType: "conditioning",
            description: "Full-field sprint, walk back. Eleven sprints, which mirrors a typical amount of full-field possessions you will play per half. No sprinting in practice means no finishing in games.",
            sets: "11 reps"
          }
        ]
      },
      {
        id: "df-b6",
        startTime: "1:20",
        duration: 10,
        title: "Cool-Down",
        phase: "Recovery",
        locked: false,
        drills: [
          {
            num: "16",
            name: "Hip Opener and IT Band",
            tag: "Recovery",
            tagType: "recovery",
            description: "Pigeon pose, 45 seconds per side. Lateral dodging compresses the IT band against the lateral knee. This stretch is your insurance policy against knee problems that develop slowly over a season.",
            sets: "2 rounds · each side"
          },
          {
            num: "17",
            name: "Low-Back Decompression",
            tag: "Spinal Recovery",
            tagType: "recovery",
            description: "Child's pose with arms extended, 60 seconds. Dodging and shooting under contact loads the lumbar spine. Decompress it intentionally before it becomes a chronic issue.",
            sets: "60 seconds"
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PLAN 5: GAME SPEED
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "game-speed",
    title: "Game Speed",
    focus: "Decision Speed · Transition · Competition",
    totalMinutes: 90,
    blocks: [
      {
        id: "gs-b1",
        startTime: "0:00",
        duration: 20,
        title: "Wall Ball",
        phase: "Non-Negotiable Warm-Up",
        locked: true,
        drills: [
          {
            num: "01",
            name: "Quick Stick — Dominant Hand",
            tag: "Eyes Up",
            tagType: "lock",
            description: "Right-to-right passes at full speed. Catching position before the ball arrives. Never break your eyes off an imaginary midfield target.",
            sets: "100 reps · dominant hand"
          },
          {
            num: "02",
            name: "Rapid-Fire Wall Ball — Full Speed",
            tag: "Max Velocity",
            tagType: "compete",
            description: "Throw as hard as you can and catch at full speed. No tempo work today. The wall ball in this session is about training your hands to function at game pace, where there is no time to slow down and be precise.",
            sets: "2 sets × 50 reps"
          },
          {
            num: "03",
            name: "Eyes-Up Call Drill",
            tag: "Scan",
            tagType: "skill",
            description: "Partner stands 10 yards behind you and holds up a number of fingers. You must call the number out loud between each wall-ball rep. If you cannot call the number, your eyes were down. This is a lacrosse IQ drill disguised as wall ball.",
            sets: "3 sets · 30 reps each"
          }
        ]
      },
      {
        id: "gs-b2",
        startTime: "0:20",
        duration: 15,
        title: "Shooting Mechanics",
        phase: "Non-Negotiable Warm-Up",
        locked: true,
        drills: [
          {
            num: "04",
            name: "Stationary Form Shooting — Near Pipe",
            tag: "Form First",
            tagType: "lock",
            description: "Set up 5 yards from the pipe. No wind-up. Hips rotate through the shot, front shoulder pulls, and the ball goes low pipe. Do not add speed until every rep is hitting the target.",
            sets: "10 reps · each pipe"
          },
          {
            num: "05",
            name: "Fast Break Finish — 3v2",
            tag: "Transition Shot",
            tagType: "compete",
            description: "Three offensive players versus two defenders in transition to cage. The ball carrier must make the right read: shoot if open, feed if the slide commits. The right decision in one second — no more. Wrong decisions get made in practice, not games.",
            sets: "6 reps"
          },
          {
            num: "06",
            name: "Pressure Shot — 5-Second Clock",
            tag: "Shot Clock",
            tagType: "compete",
            description: "Ball carrier has five seconds after catching the feed to release a shot. Defender applies active pressure. Every rep after the 5-second mark is a missed opportunity. Build a sense of internal clock for when you need to shoot.",
            sets: "4 sets × 5 reps"
          }
        ]
      },
      {
        id: "gs-b3",
        startTime: "0:35",
        duration: 15,
        title: "Decision Speed",
        phase: "Primary Work",
        locked: false,
        drills: [
          {
            num: "07",
            name: "Read and React — 2v1",
            tag: "IQ",
            tagType: "compete",
            description: "Two attackers versus one defender. Ball carrier reads where the defender's body is pointing and makes the correct pass or shot in under 1 second. The moment you think too long, the read is over. Trust what you see.",
            sets: "10 reps"
          },
          {
            num: "08",
            name: "Random Feed Decision",
            tag: "Processing Speed",
            tagType: "compete",
            description: "Feeder stands at the top and passes to a random one of three cutters. All three cutters are moving simultaneously. Receiving cutter must shoot or pass within 1.5 seconds. This rep is designed to be uncomfortable — get comfortable with it.",
            sets: "4 rounds · 5 feeds per round"
          },
          {
            num: "09",
            name: "Verbal Cue Shooting",
            tag: "Reaction",
            tagType: "compete",
            description: "Player faces away from cage. Coach calls a zone (low-left, low-right, high, pipe) and the player turns and shoots the called zone. Between cue and shot: under 1.5 seconds. Tests whether your shot selection can follow your cognitive decision.",
            sets: "5 sets × 4 reps"
          }
        ]
      },
      {
        id: "gs-b4",
        startTime: "0:50",
        duration: 20,
        title: "Transition and Competition",
        phase: "Primary Work",
        locked: false,
        drills: [
          {
            num: "10",
            name: "Full-Field Transition — 4v3",
            tag: "Transition",
            tagType: "compete",
            description: "Four offensive players transition against three defenders from defensive end to offensive end. Offense must score in under 10 seconds of entering the box. Any shot taken beyond 10 seconds counts as a turnover. Play to 5 scores.",
            sets: "5 possessions per group"
          },
          {
            num: "11",
            name: "Riding and Clearing Under Pressure",
            tag: "Both Sides",
            tagType: "compete",
            description: "Defensive unit clears against a riding attack unit. Clears count as goals. Rides that force a turnover count as goals. Every player on the field is accountable to a performance outcome — this is not a free play.",
            sets: "4 full clears"
          },
          {
            num: "12",
            name: "Scrimmage — Competition Rules",
            tag: "Compete",
            tagType: "compete",
            description: "Live 6v6 scrimmage on a half field. No coaching during the rep. Players make every decision in real time. After each possession, one player from each unit identifies one decision they would change. This is where the mental rep happens.",
            sets: "12-minute scrimmage"
          },
          {
            num: "13",
            name: "Late-Game Scenario — Two Minutes, One Goal Down",
            tag: "Pressure",
            tagType: "compete",
            description: "Offense has the ball, down by one, two minutes on the clock. Defense knows this. Both units must execute with full-game awareness. The game is decided by who practices pressure first.",
            sets: "2 reps each unit"
          }
        ]
      },
      {
        id: "gs-b5",
        startTime: "1:10",
        duration: 10,
        title: "Conditioning Finish",
        phase: "Conditioning",
        locked: false,
        drills: [
          {
            num: "14",
            name: "Max-Effort 100-Yard Dash with Stick",
            tag: "Speed",
            tagType: "conditioning",
            description: "Sprint 100 yards at absolute maximum effort with the ball in your stick. No cradling required — hold the stick in a running position. Three reps, full rest between each. Speed is a skill. Train it.",
            sets: "3 reps · full rest between"
          },
          {
            num: "15",
            name: "Defensive Slide Coverage Conditioning",
            tag: "Slide Conditioning",
            tagType: "conditioning",
            description: "Slide to the ball from the crease 15 times in a row on command. Simulate a game where you are sliding on every possession. Your slide coverage has to be explosive on the fifteenth rep, not just the first.",
            sets: "15 slides · timed"
          }
        ]
      },
      {
        id: "gs-b6",
        startTime: "1:20",
        duration: 10,
        title: "Cool-Down",
        phase: "Recovery",
        locked: false,
        drills: [
          {
            num: "16",
            name: "Full-Body Static Stretch",
            tag: "Recovery",
            tagType: "recovery",
            description: "Thirty seconds each: quads, hamstrings, hip flexors, calves, chest, and shoulders. Do these in order, every time, without exception. Consistency in recovery is the same skill as consistency in reps.",
            sets: "30 sec each group"
          },
          {
            num: "17",
            name: "Breathing Protocol — Box Breathing",
            tag: "CNS Recovery",
            tagType: "recovery",
            description: "4 seconds in, 4 seconds hold, 4 seconds out, 4 seconds hold. Repeat for 8 cycles. High-intensity competition sessions spike cortisol. Deliberate breathing at the end of training accelerates CNS recovery and improves sleep quality.",
            sets: "8 cycles"
          }
        ]
      }
    ]
  }
];

export const WEEKLY_PLAN = {
  id: "weekly-mixed",
  title: "5-Day Mixed Week",
  days: [
    { day: "Monday", planId: "shooting-heavy" },
    { day: "Tuesday", planId: "footwork-focus" },
    { day: "Wednesday", planId: "stick-and-ground-balls" },
    { day: "Thursday", planId: "dodge-and-finish" },
    { day: "Friday", planId: "game-speed" }
  ]
};

export default TRAINING_PLANS;
