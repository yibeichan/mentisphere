import { expect, test } from '@playwright/test'
import { PNG } from 'pngjs'

async function expectCanvasHasRendered(page: import('@playwright/test').Page) {
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()

  await expect
    .poll(async () => {
      const screenshot = await canvas.screenshot()
      const png = PNG.sync.read(screenshot)
      const sampledColors = new Set<string>()
      const stepX = Math.max(1, Math.floor(png.width / 12))
      const stepY = Math.max(1, Math.floor(png.height / 12))

      for (let y = 0; y < png.height; y += stepY) {
        for (let x = 0; x < png.width; x += stepX) {
          const pixelIndex = (png.width * y + x) << 2
          sampledColors.add(
            [
              png.data[pixelIndex],
              png.data[pixelIndex + 1],
              png.data[pixelIndex + 2],
              png.data[pixelIndex + 3],
            ].join(','),
          )
        }
      }

      return sampledColors.size > 1
    })
    .toBe(true)
}

test('loads the atlas and renders the 3D canvas', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByPlaceholder('Search brain regions or functions...')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Region Information' })).toBeVisible()
  await expectCanvasHasRendered(page)
})

test('search selects a region and opens its learning details', async ({ page }) => {
  await page.goto('/')

  await page.getByPlaceholder('Search brain regions or functions...').fill('memory')
  await page.getByRole('button', { name: /Hippocampus/ }).click()

  await expect(page.getByRole('heading', { name: 'Hippocampus' })).toBeVisible()
  await expect(page.getByText('Episodic memory', { exact: true })).toBeVisible()
  await expect(page.getByText(/Scoville and Milner/)).toBeVisible()
})

test('enters quiz mode and shows the first prompt', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Quiz' }).click()

  await expect(page.getByRole('heading', { name: 'Find The Region' })).toBeVisible()
  await expect(page.getByText('Prompt')).toBeVisible()
  await expect(page.getByText('Hippocampus')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled()
  await expect(page.getByText('Correct').locator('..').getByText('0')).toBeVisible()
  await expect(page.getByText('Answered').locator('..').getByText('0')).toBeVisible()
})

test('view and camera controls are available', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Deep' }).click()
  await page.getByRole('button', { name: 'Left' }).click()

  await expect(page.getByRole('button', { name: 'Deep' })).toHaveClass(/bg-slate-950/)
  await expect(page.getByRole('button', { name: 'Left' })).toHaveClass(/bg-sky-700/)
  await expectCanvasHasRendered(page)
})
