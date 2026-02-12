<?php

namespace App\Controller;

use App\Entity\Category;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class CategoryController extends AbstractController
{
    #[Route('/category/{slug}', name: 'category_show')]
    public function show(
        #[MapEntity(mapping: ['slug' => 'slug'])]
        Category $category
    ): Response
    {
        return $this->render('pages/category/show.html.twig', [
            'category' => $category,
        ]);
    }
}
