#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Biome {
    Plains,
    Desert,
    Forest,
    Mountains,
    Ocean,
}

pub struct BiomeMap {
    temperature: noise::Perlin,
    humidity: noise::Perlin,
}

impl BiomeMap {
    pub fn new(seed: u32) -> Self {
        
        Self {
            temperature: noise::Perlin::new(seed.wrapping_add(1)),
            humidity: noise::Perlin::new(seed.wrapping_add(2)),
        }
    }

    pub fn biome_at(&self, x: f64, z: f64) -> Biome {
        use noise::NoiseFn;
        let temp = self.temperature.get([x * 0.001, z * 0.001]);
        let humid = self.humidity.get([x * 0.001, z * 0.001]);
        match (temp, humid) {
            (t, _) if t < -0.3 => Biome::Ocean,
            (t, _) if t > 0.4 => Biome::Desert,
            (_, h) if h > 0.3 => Biome::Forest,
            (t, _) if t > 0.2 => Biome::Mountains,
            _ => Biome::Plains,
        }
    }
}
