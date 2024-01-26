<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원 구조체를 정의한다.
 *
 * @file /modules/member/dtos/Group.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 24.
 */
namespace modules\member\dtos;
class Group
{
    /**
     * @var string $_id 회원고유값
     */
    private string $_id;

    /**
     * @var ?string $_parent_id 부모그룹고유값
     */
    private ?string $_parent_id;

    /**
     * @var int $_depth 단계
     */
    private int $_depth = 0;

    /**
     * @var string $_name 그룹명
     */
    private string $_title;

    /**
     * @var int $_members 회원수
     */
    private int $_members = 0;

    /**
     * 그룹 구조체를 정의한다.
     *
     * @param object $group 그룹정보
     */
    public function __construct(object $group)
    {
        $this->_id = 0;
        $this->_parent_id = $group->parent_id;
        $this->_depth = $group->depth;
        $this->_title = $group->title;
        $this->_members = $group->members;
    }

    /**
     * 고유값을 가져온다.
     *
     * @return int $id
     */
    public function getId(): string
    {
        return $this->_id;
    }

    /**
     * 그룹단계를 가져온다.
     *
     * @return int $depth
     */
    public function getDepth(): int
    {
        return $this->_depth;
    }

    /**
     * 상위그룹 아이디를 가져온다.
     *
     * @return ?string $parent_id
     */
    public function getParentId(): ?string
    {
        return $this->_parent_id;
    }

    /**
     * 그룹명을 가져온다.
     *
     * @return string $title
     */
    public function getTitle(): string
    {
        return $this->_title;
    }
}
