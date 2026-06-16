use noise::{NoiseFn, Seedable};

pub struct NoiseGenerator {
    perlin: noise::Perlin,
}

impl NoiseGenerator {
    pub fn new(seed: u32) -> Self {
        let mut perlin = noise::Perlin::default();
        perlin.set_seed(seed);
        Self { perlin }
    }

    pub fn height_at(&self, x: f64, z: f64) -> f64 {
        let amplitude = 12.0;
        let frequency = 0.02;
        self.perlin.get([x * frequency, z * frequency]) * amplitude
    }

    pub fn sample_2d(&self, x: f64, z: f64, scale: f64) -> f64 {
        self.perlin.get([x * scale, z * scale])
    }

    pub fn sample_octaves(&self, x: f64, z: f64, octaves: usize, persistence: f64) -> f64 {
        let mut value = 0.0;
        let mut amplitude = 1.0;
        let mut frequency = 0.02;
        let mut max_value = 0.0;
        for _ in 0..octaves {
            value += self.perlin.get([x * frequency, z * frequency]) * amplitude;
            max_value += amplitude;
            amplitude *= persistence;
            frequency *= 2.0;
        }
        value / max_value
    }
}
